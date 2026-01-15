# Project Context: WBSKT Dashboard

## Project Overview

This is a modern **Angular 21** web application serving as a dashboard (WBSKT). It utilizes the latest Angular features, including **Standalone Components** and **Signals** for reactive state management. The application interacts with a backend API (defaulting to `http://localhost:5070/api`) to manage clients, policies, approvals, and logs.

**Key Technologies:**
*   **Framework:** Angular 21.0.4
*   **Build Tool:** Angular CLI
*   **Language:** TypeScript 5.9
*   **State Management:** Angular Signals
*   **Routing:** Angular Router
*   **HTTP Client:** Angular `HttpClient` with Interceptors
*   **Icons:** `lucide-angular`
*   **Testing:** Vitest

## Architecture & Structure

The project follows a modular, feature-based architecture within `src/app/`:

*   **`api/`**: Contains raw API interaction services (e.g., `AuthApi`). These services focus solely on making HTTP requests and typing responses.
*   **`components/`**: UI components organized by feature (e.g., `login`, `clients`, `shell`).
    *   Components are **Standalone**.
    *   Files are split into `.ts`, `.html`, and `.css`.
*   **`services/`**: Business logic and state management (e.g., `AuthService`).
    *   Services use **Signals** (`signal`, `computed`) to expose reactive state.
    *   They act as a bridge between the API layer and the UI components.
*   **`guards/`**: Route guards for security (e.g., `auth.guard.ts`).
*   **`interceptors/`**: HTTP interceptors (e.g., `auth.interceptor.ts` for attaching tokens).
*   **`ui/`**: Reusable UI components (e.g., `stat-card`, `status-badge`).

## Development Conventions

*   **Dependency Injection:** Prefer the `inject()` function over constructor injection.
*   **Reactivity:** Use Angular **Signals** for local and global state. Avoid `RxJS` for state where simple signals suffice, but use it for complex async streams (like HTTP calls).
*   **Forms:** Use **Reactive Forms** (`FormBuilder`, `Validators`) for input handling.
*   **Styling:** Component-specific CSS files are used.
*   **Naming:**
    *   Files: Kebab-case (e.g., `auth.service.ts`).
    *   Classes: PascalCase (e.g., `AuthService`).
*   **Authentication:** 
    *   **Authority (IdP):** `https://localhost:7001` (Wbskt.Auth.Api). Handles login and token issuance.
    *   **Resource API:** `https://localhost:7002/api` (Wbskt.Management.Api). Protected by tokens.
    *   **Mechanism:** OpenIddict with JWTs.
    *   **Current Flow:** *Resource Owner Password Flow* (using `client_id=postman` & secret). This is a direct replacement for the previous login form.
    *   **Future:** Migration to *Authorization Code Flow* with PKCE (`client_id=wbskt-frontend`) is recommended for production SPA usage.
    *   **Tokens:** `access_token` and `refresh_token` are stored in `localStorage`.

## Building and Running

### Prerequisites
*   Node.js (Ensure compatibility with Angular 21)
*   NPM

### Commands

*   **Start Development Server:**
    ```bash
    npm start
    # or
    ng serve
    ```
    Access the app at `http://localhost:4200/`.

*   **Build for Production:**
    ```bash
    npm run build
    # or
    ng build
    ```
    Artifacts will be stored in the `dist/` directory.

*   **Run Unit Tests:**
    ```bash
    npm test
    # or
    ng test
    ```
    Uses **Vitest** as the test runner.

## Configuration

*   **API URL:** Configured in `src/app/app.config.ts` via the `API_URL` injection token.
*   **Routes:** Defined in `src/app/app.routes.ts`.
*   **Global Providers:** Configured in `src/app/app.config.ts`.
