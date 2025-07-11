# Dental Clinic Management System (Thesis Project - Work In Progress 🚧)

## Project Overview

This thesis project, the **Dental Clinic Management System**, is a full-stack web app designed to modernize and optimize administrative tasks in a dental practice. It's **under active development**, with core features done and more planned. My main goal is to build a secure, functional, and user-friendly system to help clinics run efficiently.

---

## Key Features (Current & Future)

Here's what's in and what's coming:

- **Secure User Authentication:**
  - **User Registration:** Allows new **Patients**, **Dentists**, and **Admins** to sign up.
  - **User Login/Logout:** Standard login and logout.
  - **Password Management:** Handles forgotten passwords via email verification and reset.
  - **Email Verification:** Verifies user email addresses.
- **Role-Based Access Control (RBAC):**
  - Enforces roles: `Admin`, `Dentist`, and `Patient`.
  - Each role gets specific access, improving security and data integrity.
- **Comprehensive User Profile Management:**
  - Users can view and update their profiles (e.g., name, email, phone).
  - Secure password change.
  - **Secure Account Deletion:** Includes a multi-step confirmation to prevent accidental data loss.
- **Modern and Responsive User Interface (UI):** I built the frontend using **Material-UI (MUI)** to create a consistent, good-looking, and responsive user experience. This ensures the application works well across various devices, from desktop screens to mobile phones.
- **Solid and Scalable Architectural Design:** The app has a clear separation between its **frontend** and **backend**, and they talk to each other using **RESTful APIs**. On the frontend, I used **React Query** – it's really good for managing data from the server. It helps the app fetch data efficiently, keeps it updated, and also caches it, which makes everything feel much smoother and faster for the user, and takes some load off the backend too.

---

- **Future Enhancements (Planned Phases):**
  - **Appointment Scheduling System:** Module for managing patient appointments.
  - **Patient Dental Record Management:** Digital records for patient history, treatments, and notes.
  - **3D Visualizations for Dental Components:** Exploring 3D graphics for things like braces.

---

## Tech Stack

### Frontend (Client-side Application)

- **React**: For building the UI.
- **TypeScript**: Adds types to JavaScript.
- **Vite**: My build tool for fast development.
- **Material-UI (MUI)**: UI component library.
- **React Query** (`@tanstack/react-query`): Manages data fetching from the server.
- **React Router DOM**: Handles routing in the app.
- **Axios**: For making API calls.
- **JS-Cookie**: For managing browser cookies.

---

### Backend (Server-side Application)

- **Java**: The main language.
- **Spring Boot**: Framework for the backend.
- **Spring Security**: Handles all the security stuff.
- **Gradle**: My build automation tool.
- **Lombok**: Reduces boilerplate code.
- **MySQL Connector/J**: Connects to MySQL.
- **Argon2**: For secure password hashing.
- **Spring Mail/JavaMail API**: For sending emails.

---

### Database

- **MySQL**: Where all the data is stored.

---

## Getting Started (Local Development Setup)

## Prerequisites

Before starting, make sure you have these installed:

- **Java Development Kit (JDK) 21**: For the backend.
- **Node.js (LTS)**: For the frontend (comes with `npm`).
- **MySQL Server**: For the database.
- **Gradle**: My build tool for the backend.

---

### 1. Backend Setup (Spring Boot)

1.  **Clone the Repository:**

    ```bash
    git clone [https://github.com/gergopopovici/Dental_Clinic_Register.git](https://github.com/gergopopovici/Dental_Clinic_Register.git)
    cd Dental_Clinic_Register/Dental_Clinic_Register_BackEnd
    ```

2.  **Database & Email Configuration:**

    - **Create a MySQL Database:**
      ```sql
      CREATE DATABASE dental_clinic_db;
      ```
    - **Configure `application.properties` (`src/main/resources/application.properties`):**
      - **Database Connection:**
        ```properties
        spring.datasource.url=jdbc:mysql://localhost:3306/dental_clinic_db
        spring.datasource.username=your_mysql_username
        spring.datasource.password=your_mysql_password
        spring.jpa.hibernate.ddl-auto=update
        ```
      - **Email Service:**
        ```properties
        spring.mail.host=smtp.your-email-provider.com
        spring.mail.port=587
        spring.mail.username=your_email@example.com
        spring.mail.password=your_email_password
        spring.mail.properties.mail.smtp.auth=true
        spring.mail.properties.mail.smtp.starttls.enable=true
        ```
      - **JWT Secret (CRITICAL!):**
        ```properties
        app.jwtSecret=YourSuperStrongAndSecretJWTKeyThatIsAtLeast256BitsLongAndRandom # !!! REMEMBER TO CHANGE THIS FOR PRODUCTION !!!
        app.jwtExpirationMs=86400000
        ```

3.  **Build and Run Backend:**
    ```bash
    ./gradlew clean build
    ./gradlew bootRun
    ```
    Backend runs on `http://localhost:8080`.

---

### 2. Database Schema (Initial Setup Considerations)

_Note: Tables are often auto-generated by Spring Boot. Manual setup is only if `ddl-auto` is off or for initial roles._

If manual setup is needed:

1.  **Connect to MySQL:**
    ```bash
    mysql -u your_mysql_username -p
    ```
2.  **Select Database:**
    ```sql
    USE dental_clinic_db;
    ```
3.  **Execute SQL for roles (if needed):**
    ```sql
    CREATE TABLE IF NOT EXISTS roles (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(20) NOT NULL UNIQUE
    );
    CREATE TABLE IF NOT EXISTS user_roles (
        user_id BIGINT,
        role_id BIGINT,
        PRIMARY KEY (user_id, role_id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (role_id) REFERENCES roles(id)
    );
    INSERT INTO roles (name) VALUES ('ROLE_ADMIN'), ('ROLE_DENTIST'), ('ROLE_PATIENT') ON DUPLICATE KEY UPDATE name=name;
    ```

---

### 3. Frontend Setup (React with Vite)

1.  **Navigate to Frontend:**

    ```bash
    cd ../Dental_Clinic_Register_FrontEnd
    ```

2.  **Install Dependencies:**

    ```bash
    npm install
    ```

3.  **Configure API Endpoints (`src/config/apiUrl.ts`):**

    ```typescript
    // src/config/apiUrl.ts
    export const apiURL = "http://localhost:8080/api"; // Matches your backend URL
    export const loginApiUrl = `${apiURL}/auth/signin`;
    export const registerApiUrl = `${apiURL}/auth/signup`;
    export const passwordRequestApiUrl = `${apiURL}/users/request-password-change`;
    export const verifyPasswordChangeCodeApiUrl = `${apiURL}/users/verify-password-change-code`;
    export const updatePasswordApiUrl = `${apiURL}/users/update-password`;
    export const deleteUserAccountApiUrl = `${apiURL}/users/delete`;
    // ... add more as needed
    ```

4.  **Run Frontend:**
    ```bash
    npm start
    ```
    Frontend opens at `http://localhost:5175`.

---

## Usage Guide

Once both servers are running:

1.  Go to `http://localhost:5175`.
2.  **Register:** Create an account (check email for verification).
3.  **Login:** Use your new account.
4.  **Explore:** Check `/dashboard`, `/profile`, or other sections as they get built (like `/appointments`).
