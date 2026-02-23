# 🕒 Hourlog: Enterprise-Grade Workforce Management

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-blueviolet?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

A modern, high-performance time-tracking solution designed for distributed teams. This project demonstrates a production-ready implementation of a full-stack web application with complex state management, real-time data synchronization, and robust security patterns.

---

## 🌟 Project Motivation

In the modern remote-first work environment, traditional time-tracking tools often feel clunky or disconnected. This project was born from the need for a **"Human-Centric"** approach to workforce management. 

The goal was to build a system that:
- **Reduces Friction**: One-click clock-ins that don't disrupt the flow.
- **Ensures Transparency**: Immutable audit trails that build trust between employers and employees.
- **Visualizes Progress**: Moving beyond simple spreadsheets to intuitive, interactive data visualizations.

---

## 🚀 Key Features

### 🏢 For Employees
- **Instant Punch-In/Out**: A seamless experience with sub-second response times.
- **Interactive Calendar**: A beautifully visualized history of monthly shifts and achievements.
- **Personal Analytics**: Real-time calculation of daily and monthly working hours.

### 🛡️ For Administrators
- **Real-time Oversight**: Live dashboard showing current on-duty staff.
- **Audit & Compliance**: Full version history for every manual correction to ensure financial integrity.
- **User Management**: Granular control over employee profiles and access levels.

---

## 🛠️ Technical Stack & Architecture

This application is built with a focus on **type safety, performance, and scalability**.

- **Frontend**: [Next.js 15](https://nextjs.org/) (App Router) for Server-Side Rendering (SSR) and optimized performance.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/) for a premium, accessible UI design system.
- **Animations**: [Framer Motion](https://www.framer.com/motion/) for fluid, professional transitions and micro-interactions.
- **Backend-as-a-Service**: [Supabase](https://supabase.com/) handles Authentication, PostgreSQL Database, and Real-time subscriptions.
- **Security**: Strict **Row-Level Security (RLS)** policies ensuring data isolation between users.
- **State Management**: React Context & Hooks optimized for minimal re-renders.

---

## 🧠 Engineering Challenges & Solutions

### 🌍 Precise Timezone Management
One of the core challenges was ensuring that employees punching in from different timezones always see their logs relative to their local day while keeping the database synchronized in UTC. I implemented a robust `date-fns-tz` based system that abstracts timezone offsets and ensures "Today" is always calculated according to the user's browser context.

### 🔒 Secure Role-Based Access Control (RBAC)
Implementing a dual-role system (Employee vs. Admin) required careful balancing of security and UX. I leveraged Supabase's Auth Metadata combined with custom Database Functions to ensure that sensitive admin routes are protected both at the UI layer and the API layer.

### ⚡ Performance Optimization
Used Next.js Server Components to fetch initial data, reducing the bundle size significantly, while utilizing Client Components for the interactive clock-in UI to provide immediate feedback.

---



## 📈 Roadmap & Future Insights
- [ ] Integration with Slack/Discord for instant notifications.
- [ ] Automated PDF report generation for payroll processing.
- [ ] Mobile-native application using React Native.

---

**Developed with ❤️ to showcase professional full-stack engineering standards.**
