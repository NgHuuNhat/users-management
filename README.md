# users-management
User Register/Update:
 create account:
 - email (validate email)
 - passWord (validate pw)
 - passWordConfirm (validate pwCf)
 - capchaCode (8 character) (validate capcha)

 login/logout:
 - email
 - passWord
 - capchaCode (8 character)

 update info:
 - avatar
 - email
 - firstName
 - lastName
 - phone
 - address
 - cccd
 - socialsFB
 - socialsTW

List Users:
 - show: 
 - avatar,
 - email
 - firstName
 - 12 users/page
 - pc: 4 users/row
 - tablet: 3 users/row
 - mobile: 2 user/row
 - scroll down for load more

Detail User:
 - avatar
 - email
 - firstName
 - lastName
 - phone
 - address
 - cccd
 - socialsFB
 - socialsTW


*** 
Data input from register form

# Tech Stack

## Frontend

* Next.js (App Router)
* ReactJS
* TypeScript
* TailwindCSS
* shadcn/ui

## Form & Validation

* React Hook Form
* Zod

## State Management

* Zustand
* TanStack Query

## Backend & Database

* Firebase Auth
* Firestore Database
* Firebase Storage

## Optimization & Performance

* React.memo
* useMemo
* useCallback
* Dynamic Import
* Infinite Scroll
* Debounce
* Lazy Loading
* Skeleton Loading