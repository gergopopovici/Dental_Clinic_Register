# SmileSync - Orthodontic Clinic Management System (Thesis Project)

## Project Overview
This thesis project, SmileSync, is a distributed orthodontic clinic management system designed to provide a solution to a real-world problem. Inspired by the digitisation needs of an orthodontic clinic in Salonta, the developed web application successfully visualises the communication between patients and dentists. It focuses on secure administration, treatment tracking, and providing an at-home visual guide for patients regarding the correct placement of orthodontic elastics.

## Key Features
The application features a comprehensive suite of modules that are fully implemented:

* **Secure User Authentication & Profile Management:** System security is guaranteed by JWT-based authentication. Includes automated email verification and password reset processes. Users can view and update their profiles, with a secure account deletion process for patients.
* **Role-Based Access Control (RBAC):** Enforces distinct roles to isolate permissions: Admin, Dentist, and Patient.
* **Interactive 3D Orthodontic Configurator:** Allows dentists to edit orthodontic elements spatially in real-time. Serves as an interactive at-home guide for patients.
* **Clinical Management Modules:** Features an appointment management module. Includes service and treatment plan administration. Features a visual treatment progress bar.
* **Panoramic X-ray Viewer:** Built-in viewer with comparison and slideshow capabilities.
* **Modern and Responsive User Interface (UI):** The client side is based on React and Material UI. Fully multilingual interface supporting English, Hungarian, and Romanian. Includes both light and dark themes.
* **Solid and Scalable Architectural Design:** Implements a Spring Boot-based backend communicating via a RESTful API with the client side.

## Tech Stack
### Frontend (Client-side Application)
* **React:** For building the UI.
* **Material-UI (MUI):** UI component library.
* **React Three Fiber / Three.js:** Utilised for the interactive 3D visualisation and WebGL rendering.
* **TanStack Query (React Query):** Manages server state, data caching, and synchronisation.
* **Axios:** For making API calls.

### Backend (Server-side Application)
* **Java:** The main programming language.
* **Spring Boot:** Framework for the backend.
* **Spring Security:** Handles all the security and RBAC.
* **JSON Web Token (JWT):** Used for token-based authentication.
* **Hibernate / JPA:** For Object-Relational Mapping (ORM) and database management.
* **Spring Mail:** For sending automated emails (verification, reset, reminders).

### Database
* **MySQL:** Relational database for storing all clinic data.

## Getting Started (Local Development Setup)

### Prerequisites
Before starting, make sure you have these installed:
* **Java Development Kit (JDK):** For the backend.
* **Node.js (LTS):** For the frontend (comes with npm).
* **MySQL Server:** For the database.

### 1. Backend Setup (Spring Boot)

Clone the Repository:
```bash
git clone [https://github.com/gergopopovici/Dental_Clinic_Register.git](https://github.com/gergopopovici/Dental_Clinic_Register.git)
cd Dental_Clinic_Register/Dental_Clinic_Register_BackEnd
```

Create a MySQL Database:
```sql
CREATE DATABASE dental_clinic_db;
```

Configure `application.properties` (`src/main/resources/application.properties`):
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/dental_clinic_db
spring.datasource.username=your_mysql_username
spring.datasource.password=your_mysql_password
spring.jpa.hibernate.ddl-auto=update

spring.mail.host=smtp.your-email-provider.com
spring.mail.port=587
spring.mail.username=your_email@example.com
spring.mail.password=your_email_password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

app.jwtSecret=YourSuperStrongAndSecretJWTKeyThatIsAtLeast256BitsLongAndRandom
app.jwtExpirationMs=86400000
```

Build and Run Backend:
```bash
mvn clean install
mvn spring-boot:run
```
Backend runs on `http://localhost:8080`.

### 2. Frontend Setup (React with Vite)

Navigate to Frontend:
```bash
cd ../Dental_Clinic_Register_FrontEnd
```

Install Dependencies:
```bash
npm install
```

Configure API Endpoints (`src/config/apiUrl.ts`):
```typescript
// src/config/apiUrl.ts
export const apiURL = "http://localhost:8080/api"; // Matches your backend URL
export const loginApiUrl = `${apiURL}/auth/signin`;
export const registerApiUrl = `${apiURL}/auth/signup`;
export const passwordRequestApiUrl = `${apiURL}/users/request-password-change`;
export const verifyPasswordChangeCodeApiUrl = `${apiURL}/users/verify-password-change-code`;
export const updatePasswordApiUrl = `${apiURL}/users/update-password`;
export const deleteUserAccountApiUrl = `${apiURL}/users/delete`;
```

Run Frontend:
```bash
npm start
```
Frontend opens at `http://localhost:5175`.

### Usage Guide
Once both servers are running:
1. Go to `http://localhost:5175`.
2. Register: Create an account (check email for verification).
3. Log in: Use your new account.
4. Explore: Check your dashboards, view the 3D orthodontic configurator, and manage appointments or treatment plans.
