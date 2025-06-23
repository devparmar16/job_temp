# Backend Configuration

To run the backend server, you need to configure the necessary environment variables.

## Steps

1.  **Create a `.env` file:** In the `backend` directory, create a new file named `.env`.

2.  **Add Environment Variables:** Open the `.env` file and add the following variables:

    ```env
    # --- Server Configuration ---
    PORT=4000
    FRONTEND_URL=http://localhost:5173

    # --- Database Configuration ---
    # Your MongoDB connection string
    MONGO_URI=your_mongodb_connection_string_here

    # --- JWT Configuration ---
    # A strong, secret key for signing JWT tokens
    JWT_SECRET_KEY=your_jwt_secret_key_here
    JWT_EXPIRE=7d

    # --- Supabase Configuration (for file storage) ---
    # Your Supabase project URL
    SUPABASE_URL=your_supabase_url_here

    # Your Supabase anonymous (public) key
    SUPABASE_ANON_KEY=your_supabase_anon_key_here

    # --- Nodemailer Configuration (for sending emails) ---
    # Your email host (e.g., smtp.gmail.com)
    SMTP_HOST=your_smtp_host
    # Your email service port (e.g., 587)
    SMTP_PORT=your_smtp_port
    # Your email account username
    SMTP_USER=your_smtp_user
    # Your email account password or app-specific password
    SMTP_PASS=your_smtp_password
    ```

## Supabase Storage Setup

For profile picture uploads to work, you must also configure your Supabase storage bucket correctly:

1.  **Create a Bucket:** In your Supabase project, go to the **Storage** section and create a new bucket.
2.  **Bucket Name:** Name the bucket `resume`.
3.  **Public Access:** Make sure the bucket is **public**.
4.  **Create a Folder:** Inside the `resume` bucket, create a folder named `profile_pic`.

After creating the `.env` file and configuring Supabase, restart your backend server for the changes to take effect. 