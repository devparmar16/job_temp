import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { Job } from "../models/jobSchema.js";
import { sendEmail } from "../utils/sendEmail.js";

export const getAllJobs = catchAsyncErrors(async (req, res, next) => {
  const jobs = await Job.find({ expired: false });
  res.status(200).json({
    success: true,
    jobs,
  });
});

export const postJob = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Job Seeker") {
    return next(
      new ErrorHandler("Job Seeker not allowed to access this resource.", 400)
    );
  }
  const {
    title,
    description,
    category,
    country,
    city,
    location,
    fixedSalary,
    salaryFrom,
    salaryTo,
    companyName,
    skills,
    jobType,
    duration
  } = req.body;

  if (!title || !description || !category || !country || !city || !location || !companyName || !skills || !jobType) {
    return next(new ErrorHandler("Please provide full job details.", 400));
  }

  if ((!salaryFrom || !salaryTo) && !fixedSalary) {
    return next(
      new ErrorHandler(
        "Please either provide fixed salary or ranged salary.",
        400
      )
    );
  }

  if (salaryFrom && salaryTo && fixedSalary) {
    return next(
      new ErrorHandler("Cannot Enter Fixed and Ranged Salary together.", 400)
    );
  }
  const postedBy = req.user._id;
  const job = await Job.create({
    title,
    description,
    category,
    country,
    city,
    location,
    fixedSalary,
    salaryFrom,
    salaryTo,
    postedBy,
    companyName,
    skills,
    jobType,
    duration
  });

  const emailMessage = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
          .header { background-color: #007bff; color: white; padding: 10px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 20px; }
          .footer { margin-top: 20px; font-size: 12px; text-align: center; color: #aaa; }
          .button { display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><h1>Job Posted Successfully!</h1></div>
          <div class="content">
            <h2>Congratulations, ${req.user.name}!</h2>
            <p>Your job posting for <strong>${title}</strong> at <strong>${companyName}</strong> is now live on JobConnect.</p>
            <p>You've taken the first step towards finding the perfect candidate. We'll notify you as soon as applications start coming in.</p>
            <p>In the meantime, you can view and manage your job posts from your dashboard.</p>
            <a href="http://localhost:5173/my-jobs" class="button">Go to My Jobs</a>
          </div>
          <div class="footer"><p>&copy; ${new Date().getFullYear()} JobConnect. All rights reserved.</p></div>
        </div>
      </body>
    </html>
  `;

  try {
    await sendEmail({
        email: req.user.email,
        subject: `Your Job Posting "${title}" is Live!`,
        message: emailMessage,
    });
  } catch(error){
      return next(new ErrorHandler(error.message, 500));
  }

  res.status(200).json({
    success: true,
    message: "Job Posted Successfully!",
    job,
  });
});

export const getMyJobs = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Job Seeker") {
    return next(
      new ErrorHandler("Job Seeker not allowed to access this resource.", 400)
    );
  }
  const myJobs = await Job.find({ postedBy: req.user._id });
  res.status(200).json({
    success: true,
    myJobs,
  });
});

export const updateJob = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Job Seeker") {
    return next(
      new ErrorHandler("Job Seeker not allowed to access this resource.", 400)
    );
  }
  const { id } = req.params;
  let job = await Job.findById(id);
  if (!job) {
    return next(new ErrorHandler("OOPS! Job not found.", 404));
  }
  job = await Job.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({
    success: true,
    message: "Job Updated!",
  });
});

export const deleteJob = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Job Seeker") {
    return next(
      new ErrorHandler("Job Seeker not allowed to access this resource.", 400)
    );
  }
  const { id } = req.params;
  const job = await Job.findById(id);
  if (!job) {
    return next(new ErrorHandler("OOPS! Job not found.", 404));
  }
  await job.deleteOne();
  res.status(200).json({
    success: true,
    message: "Job Deleted!",
  });
});

export const getSingleJob = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  try {
    const job = await Job.findById(id);
    if (!job) {
      return next(new ErrorHandler("Job not found.", 404));
    }
    res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    return next(new ErrorHandler(`Invalid ID / CastError`, 404));
  }
});

export const shortlistApplicant = catchAsyncErrors(async (req, res, next) => {
    const { role, _id } = req.user;
    if (role === "Job Seeker") {
        return next(new ErrorHandler("Job Seeker not allowed to access this resource.", 400));
    }
    const { jobId, applicationId, userId } = req.body;
    if(!jobId || !applicationId || !userId){
        return next(new ErrorHandler("Please provide all details.", 400));
    }
    
    const job = await Job.findById(jobId);
    if (!job) {
        return next(new ErrorHandler("Job not found!", 404));
    }
    if(job.postedBy.toString() !== _id.toString()){
        return next(new ErrorHandler("You are not authorized to shortlist for this job.", 403));
    }

    // Check if already shortlisted
    const isShortlisted = job.shortlisted.some(s => s.applicationId.toString() === applicationId);
    if(isShortlisted){
        // Remove from shortlist
        job.shortlisted = job.shortlisted.filter(s => s.applicationId.toString() !== applicationId);
        await job.save();
        return res.status(200).json({
            success: true,
            message: "Applicant removed from shortlist.",
        });
    }

    job.shortlisted.push({
        jobSeeker: userId,
        applicationId: applicationId,
    });
    await job.save();

    res.status(200).json({
        success: true,
        message: "Applicant Shortlisted!",
    });
}); 