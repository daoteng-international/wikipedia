# Test Plan (DT 百科)

## 1. Environment Verification
- [ ] **Install Dependencies**: Run `npm install` and ensure no critical errors.
- [ ] **Dev Server**: Run `npm run dev` and ensure the server starts on `localhost`.
- [ ] **Build**: Run `npm run build` to verify the production build process.

## 2. Core Functionality Testing (Manual)
### 2.1 Basic UI
- [ ] **Landing Page**: Verify the page loads and displays the main title/search bar.
- [ ] **Responsiveness**: Check layout on Desktop and Mobile view.

### 2.2 AI Interaction
- [ ] **Query Input**: Enter a test question (e.g., "如何申請休假?").
- [ ] **Response Generation**: Verify the AI generates a response text.
- [ ] **Error Handling**: Disconnect network or provide invalid key to test error states.

## 3. Automated Tests
> Currently, no automated unit tests are set up.
- [ ] **Future**: Implement Jest/Vitest for `utils` or `components`.
