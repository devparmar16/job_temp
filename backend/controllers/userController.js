import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/userSchema.js";
import { sendToken } from "../utils/jwtToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import { createClient } from '@supabase/supabase-js';

export const register = catchAsyncErrors(async (req, res, next) => {
  const { name, email, phone, password, role } = req.body;
  if (!name || !email || !phone || !password || !role) {
    return next(new ErrorHandler("Please fill full registration form!"));
  }
  const isEmail = await User.findOne({ email });
  if (isEmail) {
    return next(new ErrorHandler("Email already registered!"));
  }
  const user = await User.create({
    name,
    email,
    phone,
    password,
    role,
  });

  const subject = `Welcome to Job Portal, ${user.name}!`;
  let message;
  if (user.role === "Job Seeker") {
    message = `
      <h1>Hi ${user.name},</h1>
      <p>Welcome to Job Portal! We're excited to have you as a Job Seeker.</p>
      <p>Start exploring thousands of job opportunities tailored for you.</p>
      <p>Best of luck with your job search!</p>
      <p>Regards,</p>
      <p>Job Portal Team</p>
    `;
  } else if (user.role === "Employer") {
    message = `
      <h1>Hi ${user.name},</h1>
      <p>Welcome to Job Portal! We're thrilled to have you as an Employer.</p>
      <p>Post job openings and find the best talent for your organization.</p>
      <p>We look forward to helping you build a great team!</p>
      <p>Regards,</p>
      <p>Job Portal Team</p>
    `;
  }

  try {
    await sendEmail({
      email: user.email,
      subject,
      message,
    });
  } catch (error) {
    console.error("Error sending registration email:", error);
    // Optional: You might want to add more robust error handling/logging here
  }

  sendToken(user, 201, res, "User Registered!");
});

export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    return next(new ErrorHandler("Please provide email, password and role."));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid Email Or Password.", 400));
  }
  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid Email Or Password.", 400));
  }
  if (user.role !== role) {
    return next(
      new ErrorHandler(`User with provided email and role not found!`, 404)
    );
  }
  sendToken(user, 200, res, "User Logged In!");
});

export const logout = catchAsyncErrors(async (req, res, next) => {
  res
    .status(201)
    .cookie("token", "", {
      httpOnly: true,
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "Logged Out Successfully.",
    });
});

export const getUser = catchAsyncErrors((req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
});

export const updateUserProfile = catchAsyncErrors(async (req, res, next) => {
    const { _id } = req.user;
    // Remove fields that should not be updatable this way
    const { role, password, ...updateData } = req.body;

    const user = await User.findByIdAndUpdate(_id, updateData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
        message: "Profile Updated!",
        user,
    });
});

export const updateProfilePicture = catchAsyncErrors(async (req, res, next) => {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
        return next(new ErrorHandler("Supabase is not configured. Missing URL or Key.", 500));
    }
    if (!req.file) {
        return next(new ErrorHandler("Profile picture file required!", 400));
    }
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    const user = await User.findById(req.user._id);

    const bucketName = 'resume';
    const folderName = 'profile_pic';

    // If user already has a profile picture, try to delete the old one.
    if (user.profilePicture && user.profilePicture.fileName) {
        try {
            const { error: deleteError } = await supabase.storage.from(bucketName).remove([user.profilePicture.fileName]);
            if (deleteError) {
                // Log the deletion error but don't block the upload
                console.error("Supabase delete error:", deleteError.message);
            }
        } catch (error) {
            console.error("An unexpected error occurred during file deletion:", error.message);
        }
    }

    const newFileName = `${user._id}_${Date.now()}.png`; // Using user ID for uniqueness
    const filePath = `${folderName}/${newFileName}`;
    
    const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, req.file.buffer, {
            contentType: req.file.mimetype,
            upsert: true // Using upsert can simplify logic and prevent errors if file exists
        });

    if (uploadError) {
        console.error("Supabase upload error:", uploadError);
        return next(new ErrorHandler(`Supabase upload failed: ${uploadError.message}`, 500));
    }

    const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(filePath);
    
    if (!urlData || !urlData.publicUrl) {
        return next(new ErrorHandler("Could not get public URL for the uploaded file.", 500));
    }
    
    const profilePictureUrl = urlData.publicUrl;

    user.profilePicture = {
        url: profilePictureUrl,
        fileName: filePath, // Store the full path including the folder
    };

    await user.save();

    res.status(200).json({
        success: true,
        message: "Profile Picture Updated!",
        user,
    });
});

export const removeProfilePicture = catchAsyncErrors(async (req, res, next) => {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
        return next(new ErrorHandler("Supabase is not configured. Missing URL or Key.", 500));
    }
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    const user = await User.findById(req.user._id);

    const bucketName = 'resume';

    // If user has a profile picture (and it's not the default one), delete it from Supabase
    if (user.profilePicture && user.profilePicture.fileName) {
        const { error: deleteError } = await supabase.storage.from(bucketName).remove([user.profilePicture.fileName]);
        if (deleteError) {
            console.error("Supabase delete error on removal:", deleteError.message);
            // Don't fail if file not found, just proceed to reset the DB record.
            if (!deleteError.message.toLowerCase().includes('not found')) {
               return next(new ErrorHandler(`Could not remove old picture: ${deleteError.message}`, 500));
            }
        }
    }

    // Reset to default
    user.profilePicture = {
        url: "https://t3.ftcdn.net/jpg/05/17/79/88/360_F_517798849_WuXhHTpg2djTbfNf0FQAjzFEoluHpnct.jpg",
        fileName: "",
    };

    await user.save();

    res.status(200).json({
        success: true,
        message: "Profile Picture Removed!",
        user,
    });
}); 