import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { Application } from "../models/applicationSchema.js";
import { Job } from "../models/jobSchema.js";
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import pdf from "pdf-parse";
import { getAtsScore } from "../utils/aiHelper.js";
import { sendEmail } from "../utils/sendEmail.js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const postApplication = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Employer") {
    return next(new ErrorHandler("Employer not allowed to access this resource.", 400));
  }
  if (!req.file) {
    return next(new ErrorHandler("Resume file required!", 400));
  }

  const { name, email, coverLetter, phone, address, jobId } = req.body;
  if (!name || !email || !coverLetter || !phone || !address || !jobId) {
    return next(new ErrorHandler("Please fill all fields.", 400));
  }

  const applicantID = { user: req.user._id, role: "Job Seeker" };

  const alreadyApplied = await Application.findOne({
    "applicantID.user": applicantID.user,
    jobID: jobId,
  });

  if (alreadyApplied) {
    return next(new ErrorHandler("You have already applied for this job.", 400));
  }
  
  const jobDetails = await Job.findById(jobId);
  if (!jobDetails) {
    return next(new ErrorHandler("Job not found!", 404));
  }
  
  const employerID = { user: jobDetails.postedBy, role: "Employer" };

  // Upload to Supabase
  const resumeFileName = `${req.user.name.split(' ').join('_')}_${Date.now()}.pdf`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('resume')
    .upload(resumeFileName, req.file.buffer, {
      contentType: req.file.mimetype,
    });
    
  if (uploadError) {
    return next(new ErrorHandler("Failed to upload resume to Supabase.", 500));
  }
  
  const { data: urlData } = supabase.storage.from('resume').getPublicUrl(resumeFileName);
  const resumeUrl = urlData.publicUrl;

  // Parse resume and get ATS score
  const resumeText = (await pdf(req.file.buffer)).text;
  const atsScore = await getAtsScore(resumeText, jobDetails.skills);

  const application = await Application.create({
    name,
    email,
    coverLetter,
    phone,
    address,
    applicantID,
    employerID,
    jobID: jobId,
    resume: {
        url: resumeUrl,
        fileName: resumeFileName,
    },
    atsScore,
  });

  const emailMessage = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
          .header { background-color: #28a745; color: white; padding: 10px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 20px; }
          .footer { margin-top: 20px; font-size: 12px; text-align: center; color: #aaa; }
          .button { display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><h1>Application Received!</h1></div>
          <div class="content">
            <h2>Hi ${name},</h2>
            <p>We've successfully received your application for the <strong>${jobDetails.title}</strong> position at <strong>${jobDetails.companyName}</strong>.</p>
            <p>Your profile is now under review. We appreciate your interest and will get back to you soon if your qualifications match our needs.</p>
            <p>You can track the status of all your applications on your dashboard.</p>
            <a href="http://localhost:5173/my-applications" class="button">View My Applications</a>
          </div>
          <div class="footer"><p>&copy; ${new Date().getFullYear()} JobConnect. All rights reserved.</p></div>
        </div>
      </body>
    </html>
  `;

  try {
    await sendEmail({
        email: email,
        subject: `Confirmation of Your Application for ${jobDetails.title}`,
        message: emailMessage,
    });
  } catch(error){
      return next(new ErrorHandler(error.message, 500));
  }

  res.status(200).json({
    success: true,
    message: "Application Submitted!",
    application,
  });
});

export const getMyApplications = catchAsyncErrors(async (req, res, next) => {
  const { role, _id } = req.user;
  if (role === "Employer") {
    return next(new ErrorHandler("Employers cannot view applications this way.", 400));
  }
  const applications = await Application.find({ "applicantID.user": _id }).populate('jobID');
  res.status(200).json({
    success: true,
    applications,
  });
});

export const getJobApplications = catchAsyncErrors(async (req, res, next) => {
  const { role, _id } = req.user;
  if (role === "Job Seeker") {
    return next(new ErrorHandler("Job Seekers cannot access this resource.", 400));
  }
  const { jobId } = req.params;
  const job = await Job.findById(jobId);
  if(!job){
      return next(new ErrorHandler("Job not found!", 404));
  }
  if(job.postedBy.toString() !== _id.toString()){
    return next(new ErrorHandler("You are not authorized to view applications for this job.", 403));
  }

  const applications = await Application.find({ jobID: jobId });
  res.status(200).json({
    success: true,
    applications,
  });
});

export const deleteApplication = catchAsyncErrors(async (req, res, next) => {
  const { role, _id } = req.user;
  const { id } = req.params;
  const application = await Application.findById(id);
  if (!application) {
    return next(new ErrorHandler("Application not found!", 404));
  }

  if(role === 'Job Seeker' && application.applicantID.user.toString() !== _id.toString()){
      return next(new ErrorHandler("You are not authorized to delete this application.", 403));
  }

  if(role === 'Employer' && application.employerID.user.toString() !== _id.toString()){
    return next(new ErrorHandler("You are not authorized to delete this application.", 403));
  }
  
  await application.deleteOne();
  res.status(200).json({
    success: true,
    message: "Application Deleted Successfully!",
  });
});

export const getSingleApplication = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const application = await Application.findById(id).populate('applicantID.user').populate('employerID.user');
    if(!application){
        return next(new ErrorHandler("Application not found!", 404));
    }
    // Add authorization check later
    res.status(200).json({
        success: true,
        application,
    });
});

export const checkAts = catchAsyncErrors(async (req, res, next) => {
    const { role } = req.user;
    if (role === "Employer") {
        return next(new ErrorHandler("Employer not allowed to access this resource.", 400));
    }
    if (!req.file) {
        return next(new ErrorHandler("Resume file required!", 400));
    }
    const { jobId } = req.body;
    if (!jobId) {
        return next(new ErrorHandler("Job ID is required.", 400));
    }

    const jobDetails = await Job.findById(jobId);
    if (!jobDetails) {
        return next(new ErrorHandler("Job not found!", 404));
    }

    const resumeText = (await pdf(req.file.buffer)).text;
    const atsScore = await getAtsScore(resumeText, jobDetails.skills);

    res.status(200).json({
        success: true,
        message: "ATS Score Calculated Successfully!",
        atsScore,
    });
}); 