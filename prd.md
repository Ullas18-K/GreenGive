# Digital Heroes · PRD — Golf Charity Subscription Platform  
**SAMPLE · Selection Process Only · digitalheroes.co.in**

## Product Requirements Document (PRD)

**Project:** Golf Charity Subscription Platform  
**Issued By:** Digital Heroes · digitalheroes.co.in  
**Document Type:** Product Requirements Document (PRD)  
**Purpose:** Trainee Selection Process — Sample Assignment  
**Version:** 1.0 · March 2026  
**Audience:** Full-Stack Development Trainees / Applicants  

**Document Summary:**  
This PRD outlines the complete product specification for a subscription-based golf platform combining performance tracking, monthly prize draws, and charitable giving. It serves as the single source of truth for design, development, and evaluation.

---

## 01 PROJECT OVERVIEW

The platform is a subscription-driven web application combining:
- Golf performance tracking  
- Charity fundraising  
- Monthly draw-based reward engine  

Users will:
- Subscribe (monthly or yearly)
- Enter golf scores (Stableford format)
- Participate in monthly prize draws
- Support a charity of their choice

---

## 02 CORE OBJECTIVES

- **Subscription Engine:** Robust subscription and payment system  
- **Score Experience:** Simple and engaging score entry  
- **Draw Engine:** Algorithmic or random monthly draws  
- **Charity Integration:** Seamless contribution logic  
- **Admin Control:** Full dashboard control  
- **UI/UX:** Modern, standout design  

---

## 03 USER ROLES

### Public Visitor
- View platform concept  
- Explore charities  
- Understand draw mechanics  
- Initiate subscription  

### Registered Subscriber
- Manage profile  
- Enter/edit scores  
- Select charity  
- View participation and winnings  
- Upload winner proof  

### Administrator
- Manage users & subscriptions  
- Configure and run draws  
- Manage charities  
- Verify winners  
- Access analytics  

---

## 04 SUBSCRIPTION & PAYMENT SYSTEM

- **Plans:** Monthly & Yearly (discounted)  
- **Gateway:** Stripe (or equivalent)  
- **Access Control:** Restricted for non-subscribers  
- **Lifecycle:** Renewal, cancellation, expiry handling  
- **Validation:** Real-time subscription checks  

---

## 05 SCORE MANAGEMENT SYSTEM

### Input Requirements
- Last 5 golf scores  
- Range: 1–45 (Stableford)  
- Each score must include a date  

### Functional Behaviour
- Only latest 5 scores stored  
- New score replaces oldest  
- Display: newest first  

---

## 06 DRAW & REWARD SYSTEM

### Draw Types
- 5-Number Match  
- 4-Number Match  
- 3-Number Match  

### Draw Logic
- Random (lottery-style)  
- Algorithmic (weighted by score frequency)  

### Operations
- Monthly draws  
- Admin-controlled publishing  
- Simulation mode before publish  
- Jackpot rollover if no winner  

---

## 07 PRIZE POOL LOGIC

| Match Type       | Pool Share | Rollover |
|----------------|-----------|----------|
| 5-Number Match | 40%       | Yes      |
| 4-Number Match | 35%       | No       |
| 3-Number Match | 25%       | No       |

- Based on active subscribers  
- Equal split among winners  
- Jackpot rolls over if unclaimed  

---

## 08 CHARITY SYSTEM

### Contribution Model
- Default: minimum 10%  
- Users can increase contribution  
- Independent donation option  

### Features
- Searchable charity directory  
- Charity profiles (description, images, events)  
- Featured charities on homepage  

---

## 09 WINNER VERIFICATION SYSTEM

- Applies only to winners  
- **Proof Upload:** Screenshot of scores  
- **Admin Review:** Approve / Reject  
- **Payment Status:** Pending → Paid  

---

## 10 USER DASHBOARD

Must include:
- Subscription status  
- Score entry/edit  
- Selected charity & contribution  
- Participation summary  
- Winnings overview  

---

## 11 ADMIN DASHBOARD

### User Management
- View/edit profiles  
- Edit scores  
- Manage subscriptions  

### Draw Management
- Configure logic  
- Run simulations  
- Publish results  

### Charity Management
- Add/edit/delete charities  

### Winners Management
- Verify winners  
- Track payouts  

### Reports & Analytics
- Total users  
- Prize pool  
- Charity contributions  
- Draw statistics  

---

## 12 UI / UX REQUIREMENTS

- Avoid traditional golf design  
- Emotion-driven interface  
- Clean, modern UI  

### Homepage
- Clear explanation  
- Strong CTA  

### Design
- Micro-interactions  
- Smooth animations  

---

## 13 TECHNICAL REQUIREMENTS

- Mobile-first responsive design  
- Optimised performance  
- Secure authentication (JWT/session)  
- Email notifications  

---

## 14 SCALABILITY

- Multi-country support  
- Corporate/team accounts  
- Campaign modules  
- Mobile app readiness  

---

## 15 MANDATORY DELIVERABLES

- Live deployed website  
- Functional user panel  
- Functional admin panel  
- Database integration (e.g., Supabase)  
- Clean, structured source code  

### Deployment Constraints
- New Vercel account  
- New Supabase project  
- Proper environment variables  

---

## 16 EVALUATION CRITERIA

- Requirements understanding  
- System design quality  
- UI/UX creativity  
- Data accuracy  
- Scalability  
- Problem-solving  

### Testing Checklist
- Signup & login  
- Subscription flow  
- Score logic  
- Draw system  
- Charity contribution  
- Winner verification  
- Dashboard functionality  
- Admin panel  
- Data accuracy  
- Responsive design  
- Error handling  

---

# Digital Heroes

**Premium Full-Stack Development & Digital Marketing Agency**

Digital Heroes is a full-stack development and digital marketing agency led by Shreyansh Singh.

### Key Stats
- 2.5M+ YouTube Subscribers  
- 2,000+ Brands Built  
- $10M+ Sales Generated  
- <1.5s Load Time  
- 7–10 Years Experience  

---

## Services

- Full-Stack / MERN Development  
- Shopify & WordPress Builds  
- UI/UX & CRO Design  
- Brand Incubation  
- Performance Optimisation  
- Ongoing Support  

---

## Links

- Website: https://digitalheroes.co.in  
- Portfolio: https://portfolio.digitalheroes.co.in  
- YouTube: https://youtube.com/@DigitalMarketingHeroes  
- Figma: https://www.figma.com/design/uz7W70LLi2uHDokNAJEaJQ/All-Projects---Demo  

---

*This document was prepared by Digital Heroes as part of a selection process assignment.*  