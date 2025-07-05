This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.





# Personal Finance Visualizer

A full-stack web application for tracking and visualizing personal finances, built with Next.js, React, shadcn/ui, Recharts, and MongoDB.

## Features Implemented:

### Stage 1: Basic Transaction Tracking
- Add/Edit/Delete transactions (amount, date, description).
- Transaction list view.
- Single chart: Monthly expenses bar chart.
- Basic form validation.

### Stage 2: Categories & Dashboard
- All Stage 1 features.
- Predefined categories for transactions (managed via API and selectable in form).
- Category-wise pie chart.
- Dashboard with summary cards: total expenses, category breakdown, most recent transactions.

### Stage 3: Budgeting & Insights
- All Stage 2 features.
- Set monthly category budgets.
- Budget vs actual comparison chart (for the current month).
- Simple spending insights (e.g., over/under budget notifications).

## Common Requirements Met:
- Stack: Next.js, React, shadcn/ui, Recharts, MongoDB.
- Responsive design: Implemented using Tailwind CSS's utility classes.
- Error states: User-friendly error messages for API calls and form validation.

## Live Deployment
[Link to your Vercel deployment URL here]

## GitHub Repository
[Link to your GitHub repository here]

## How to Run Locally

### Prerequisites
- Node.js (LTS version recommended)
- npm (comes with Node.js)
- MongoDB (Atlas Cloud or local Community Server)

### Setup Steps

1.  Clone the repository:
    ```bash
    git clone [https://github.com/your-username/personal-finance-visualizer.git](https://github.com/your-username/personal-finance-visualizer.git)
    cd personal-finance-visualizer
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Configure Environment Variables:
    Create a `.env.local` file in the root of the project and add your MongoDB connection URI:
    ```
    MONGODB_URI="your_mongodb_connection_string_here"
    ```
    (Replace `your_mongodb_connection_string_here` with your actual MongoDB Atlas or local connection string).

4.  Start MongoDB (if running locally):
    Ensure your local MongoDB server is running.

5.  Seed Categories (Optional but recommended):
    If you're starting with an empty database, you might want to add some categories using a tool like Postman/Insomnia by sending a POST request to `http://localhost:3000/api/categories` with a JSON body like `{ "name": "Groceries", "color": "#FFC107" }`.

6.  Run the development server:
    ```bash
    npm run dev
    ```

7.  Open your browser and navigate to `http://localhost:3000`.

## Design Choices & Considerations
- Data Fetching: Client-side fetching using `useEffect` and `useState` for simplicity given the assignment scope (no server components for data fetching). For larger applications, more advanced data fetching libraries or Next.js's server components/actions would be considered.
- Form Management: Basic `useState` for form fields. For more complex forms, a form library like React Hook Form could be beneficial.
- UI Components: Utilized `shadcn/ui` for a consistent, accessible, and responsive design.
- Charting: Recharts library was chosen for its flexibility and ease of use with React.
- Database Schema: Simple, focused schemas for `Transaction`, `Category`, and `Budget` with appropriate relationships and validation rules.
- Error Handling: Basic error display on the UI for API responses.

## Future Improvements (Beyond Assignment Scope)
- Income tracking
- Recurring transactions
- More advanced reporting/filters
- Exporting data
- Notifications for budget overruns
