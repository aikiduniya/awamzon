# Shopify Studio

MASTER PROMPT — HEADLESS SHOPIFY ECOMMERCE STORE + FULL ADMIN CMS

Build a production-ready, highly secure, SEO-first, fully dynamic Headless Shopify Ecommerce Store using Lovable for the frontend and custom admin/CMS, with Shopify as the ecommerce backend.

The system must be designed so that no normal website content, SEO setting, design setting, navigation item, marketing section, homepage section, business setting, or frontend configuration is hard-coded.

The goal is:

Lovable Custom Storefront + Custom Admin CMS + Shopify Commerce Backend

1. CORE ARCHITECTURE

Use this architecture:

Customer → Custom Lovable Storefront → Secure Backend/API Layer → Shopify APIs → Shopify Store

Shopify must remain the source of truth for:

Products

Product variants

Product prices

Inventory

Collections

Cart

Checkout

Orders

Customers

Shopify discounts where applicable

Shopify payment processing

Shipping configuration where applicable

Custom Admin/CMS must control:

Website content

Homepage

Pages

Blog

Navigation

Header

Footer

Banners

Sections

Theme settings

Typography

Colors

Layout

SEO

Meta data

Schema settings

Social links

Contact information

Announcement bars

Popups

Marketing content

Tracking settings

Analytics settings

Redirects

Robots configuration

Sitemap configuration

Storefront behavior

Feature toggles

Custom scripts where safely supported

Legal pages

FAQ

Testimonials

Reviews display settings

Newsletter

Promotional sections

DO NOT expose Shopify Admin API credentials in frontend code.

Use secure server-side API communication and environment variables.

2. TECHNOLOGY REQUIREMENTS

Use modern production-ready architecture.

Frontend:

React

TypeScript

Vite or the most appropriate Lovable-supported architecture

Tailwind CSS

Responsive design

Mobile-first

Accessible HTML

Semantic HTML

Component-based architecture

Backend:

Secure server-side API layer

Shopify Storefront API

Shopify Admin API only from server-side

Webhooks

Database for CMS/admin configuration

Proper authentication

Role-based authorization

Use reusable components.

Avoid duplicated code.

Use clean architecture.

3. ZERO HARD-CODED CONTENT PRINCIPLE

This is extremely important.

DO NOT hard-code:

Store name

Logo

Favicon

Phone

Email

Address

Social links

Currency display

Header menu

Footer menu

Navigation

Homepage sections

Homepage text

Homepage images

Banner content

CTA buttons

Promotional messages

SEO titles

Meta descriptions

Keywords

Open Graph data

Twitter/X metadata

Schema data

Contact information

Copyright text

Footer content

Blog categories

FAQ

Testimonials

Announcement bar

Popup content

Newsletter content

Theme colors

Fonts

Typography

Border radius

Buttons

Layout options

All of these must be configurable from Admin.

If something is normally static, create an appropriate Admin setting for it.

4. CUSTOM ADMIN PANEL

Create a complete secure Admin Dashboard.

Admin modules:

Dashboard

Store Settings

Theme Settings

Homepage Builder

Pages

Navigation

Header

Footer

Shopify Products

Shopify Collections

Inventory Overview

Orders

Customers

Blog

Blog Categories

Media Library

Banners

Promotions

Coupons/Discount display

Reviews

FAQ

Testimonials

Popups

Newsletter

Contact Messages

SEO Manager

Redirect Manager

Sitemap Settings

Robots.txt Settings

Schema/Structured Data

Analytics

Tracking Scripts

Social Media

Legal Pages

Email Settings

Security Settings

Cache Settings

Feature Flags

API Settings

Shopify Settings

Users

Roles & Permissions

Activity Logs

System Logs

Backup/Export settings where applicable

5. ADMIN ROLES

Implement:

Super Admin

Admin

Editor

SEO Manager

Content Manager

Order Manager

Support Manager

Use granular permissions.

Permissions should include:

View

Create

Edit

Delete

Publish

Unpublish

Export

Import

Manage settings

Super Admin must have full control.

6. ADMIN DASHBOARD

Dashboard should display:

Total orders

Revenue

Average order value

Customers

Products

Low-stock products

Out-of-stock products

Top products

Recent orders

Recent customers

Conversion-related metrics where available

Traffic metrics if analytics connected

Shopify sync status

API status

System health

Recent admin activity

Cards should be clickable and lead to relevant modules.

7. SHOPIFY INTEGRATION

Implement secure Shopify integration.

Admin should be able to configure:

Shopify store domain

Storefront API configuration

API configuration

Webhook configuration

Sync settings

Cache settings

Product synchronization settings

Never expose private Shopify credentials to browser/client-side code.

Use environment variables/server-side secrets.

8. PRODUCT SYSTEM

Products must be retrieved dynamically from Shopify.

Support:

Product title

Description

Images

Videos where Shopify provides them

Price

Compare-at price

Variants

SKU

Availability

Inventory status

Collections

Tags

Vendor

Product options

Product metafields where appropriate

Product pages must be dynamically generated.

No product should require frontend code changes.

9. COLLECTION / CATEGORY SYSTEM

Support Shopify collections.

Collection pages must include:

SEO title

SEO description

Filters

Sorting

Pagination

Product count

Breadcrumbs

Collection image where available

Custom CMS content

FAQ section

Related collections

Schema markup

Admin should be able to control additional SEO/content fields through the CMS.

10. SEARCH

Implement powerful product search.

Support:

Search suggestions

Product search

Collection search

Typo tolerance where supported

Search result pagination

Filters

Sorting

No-result page

Search analytics

Admin should control:

Search settings

Search placeholder

No-result message

Suggested content

Search page SEO

11. CART

Implement Shopify cart integration.

Support:

Add to cart

Remove from cart

Update quantity

Variant selection

Cart drawer

Cart page

Quantity validation

Inventory validation

Empty cart state

Free shipping progress bar if enabled

Promotional messages

Cross-sell

Upsell

Admin controls all visible messaging and promotional content.

12. CHECKOUT

Use Shopify checkout.

Do not build a fake/custom payment processor.

Customer should be redirected to Shopify checkout using the appropriate Shopify-supported flow.

Support:

Secure checkout

Shopify payment methods

Shipping

Taxes

Discounts

Customer information

Where checkout customization is controlled by Shopify, clearly keep that responsibility inside Shopify Admin.

13. CUSTOMER ACCOUNT

Support:

Login

Registration

Logout

Password recovery if supported by chosen Shopify customer architecture

Profile

Addresses

Order history

Order details

Account dashboard

Do not store sensitive customer credentials unnecessarily.

14. HOMEPAGE BUILDER

Create a drag/reorder style homepage section manager.

Admin can:

Enable/disable sections

Reorder sections

Duplicate sections

Delete sections

Edit content

Upload images

Set links

Set buttons

Schedule sections

Set visibility

Configure desktop/mobile images

Available sections:

Hero

Announcement

Featured collections

Featured products

Product grid

Product carousel

Promotional banner

Image + text

Rich text

Brand logos

Testimonials

FAQ

Newsletter

Blog posts

Instagram/social section where API permits

Video

Countdown

Trust badges

Custom HTML only through a secure controlled module

Spacer/divider

Do not hard-code homepage layout.

15. HEADER

Admin-controlled header.

Settings:

Logo

Logo dimensions

Announcement bar

Menu

Mega menu

Search

Account

Cart

Wishlist if implemented

Mobile menu

Sticky header

Header height

Header layout

Icons

Colors

Typography

16. FOOTER

Admin-controlled footer.

Support:

Multiple columns

Navigation menus

Newsletter

Social links

Contact details

Payment icons

Trust badges

Copyright

Legal links

Custom content

Everything editable from Admin.

17. THEME CUSTOMIZER

Create a complete theme settings module.

Admin controls:

Colors

Primary

Secondary

Accent

Background

Surface

Text

Heading

Muted text

Border

Buttons

Button hover

Header

Footer

Announcement bar

Typography

Heading font

Body font

Font sizes

Font weights

Line heights

Letter spacing

Layout

Container width

Section spacing

Grid spacing

Border radius

Button radius

Card radius

Shadows

Responsive

Mobile settings

Tablet settings

Desktop settings

Use CSS variables generated from Admin settings.

Do not hard-code theme colors inside components.

18. MEDIA LIBRARY

Create media management.

Support:

Upload

Replace

Delete

Search

Categories

Alt text

Caption

Filename

Title

Description

Image dimensions

File size

WebP/AVIF optimization where possible

Every image must support editable SEO-friendly ALT text.

19. SEO SYSTEM — VERY IMPORTANT

Build a complete SEO management system.

Admin controls:

Global SEO

Site title

Default meta title

Default meta description

Default keywords

Default OG image

Twitter/X image

Canonical URL

Brand name

Organization details

Page SEO

For every page:

Meta title

Meta description

Canonical

Robots

OG title

OG description

OG image

Twitter title

Twitter description

Twitter image

Schema type

Custom schema JSON-LD

Product SEO

Support SEO fields where appropriate.

Collection SEO

Support SEO fields.

Blog SEO

Support:

Article title

Meta title

Meta description

Canonical

OG

Article schema

20. SEO TECHNICAL REQUIREMENTS

Implement:

Semantic HTML

Clean URLs

Canonical URLs

XML sitemap

Robots.txt

Breadcrumbs

Structured data

Open Graph

Twitter/X cards

Proper heading hierarchy

Image ALT

Lazy loading

Responsive images

WebP/AVIF where possible

Minified assets

Code splitting

Fast loading

Core Web Vitals optimization

404 page

301 redirects

410 handling where appropriate

Pagination SEO

Noindex controls

Duplicate content prevention

Admin must control SEO settings without modifying source code.

21. STRUCTURED DATA / SCHEMA

Automatically generate valid JSON-LD where applicable.

Support:

Organization

WebSite

WebPage

BreadcrumbList

Product

Offer

AggregateRating

Review

Article

FAQPage

LocalBusiness where applicable

Admin must be able to enable/disable schema types and provide custom schema where necessary.

Validate generated schema and avoid duplicate/conflicting structured data.

22. URL / SLUG MANAGEMENT

Admin must control:

Page slug

Blog slug

Category/collection URL configuration where platform permits

Product URL handling where Shopify controls it

Canonical URLs

Redirects

Create Redirect Manager:

Old URL

New URL

Status code

Active/inactive

23. BLOG / CONTENT MANAGEMENT

Create complete CMS blog system.

Support:

Posts

Categories

Authors

Featured images

Tags

Slugs

Excerpt

Rich content

SEO

Publishing

Scheduling

Drafts

Featured posts

Related posts

Admin should be able to control all content.

24. FAQ

Admin can:

Create FAQ categories

Add questions

Add answers

Reorder

Enable/disable

Assign FAQs to pages

Generate FAQ schema when appropriate

25. REVIEWS

Where Shopify/review integration supports it:

Display reviews

Rating

Review count

Review moderation if stored by custom system

Review visibility

Review schema

Admin controls review display settings.

26. POPUPS

Create popup manager.

Admin controls:

Popup title

Description

Image

Button

Link

Delay

Exit intent where technically supported

Frequency

Device targeting

Page targeting

Start/end date

Enable/disable

27. ANNOUNCEMENT BAR

Admin controls:

Text

Link

Button

Background

Text color

Position

Close button

Scheduling

Device visibility

28. MARKETING

Create marketing settings.

Support:

Promotional banners

Campaign landing pages

Newsletter

Discount messaging

Cross-sell

Upsell

Recently viewed

Related products

Abandoned-cart integration hooks where supported

Do not implement deceptive dark patterns.

29. ANALYTICS

Admin-configurable integrations:

Google Analytics 4

Google Tag Manager

Meta Pixel

TikTok Pixel

Other custom analytics IDs

Admin must enter IDs through settings.

Do not hard-code tracking IDs.

Provide enable/disable switches.

Support consent-aware loading where required.

30. GOOGLE ADSENSE

If AdSense is required, create an Admin module for:

AdSense publisher ID

Ad unit IDs

Header ad

Homepage ad

Category ad

Product ad

Blog ad

In-content ad

Sidebar ad

Footer ad

Mobile ad

Desktop ad

Admin controls:

Enable/disable

Placement

Frequency

Device visibility

Do not hard-code publisher IDs or ad unit IDs.

Ensure ads do not violate Google's policies or interfere with navigation/checkout.

31. NEWSLETTER

Support:

Newsletter form

Email validation

Duplicate prevention

Success/error messages

Admin subscriber list

Export

Subscription status

Allow integration with an email provider through secure configuration.

32. CONTACT SYSTEM

Create:

Contact page

Contact form

Admin inbox

Spam protection

Rate limiting

Honeypot

Email notification

Status management

Admin controls:

Form fields

Labels

Success message

Error message

Recipient email

Auto-response where configured

33. EMAIL SETTINGS

Admin can configure:

SMTP host

Port

Encryption

Username

Password

From name

From email

Never expose SMTP credentials to frontend.

Provide test email functionality.

34. LEGAL PAGES

Admin-managed:

Privacy Policy

Terms & Conditions

Refund Policy

Shipping Policy

Cookie Policy

Disclaimer

About Us

Each must have independent SEO settings.

35. FEATURE FLAGS

Create global feature flags:

Wishlist

Reviews

Blog

Newsletter

Popup

Search

Mega menu

Product comparison

Recently viewed

Recommendations

Ads

Analytics

Chat widget

Cookie banner

Admin can enable/disable each feature.

36. SOCIAL MEDIA

Admin controls:

Facebook

Instagram

YouTube

TikTok

Pinterest

X/Twitter

LinkedIn

WhatsApp

Only show configured social platforms.

37. WHATSAPP / CHAT

Create optional floating contact/chat widget.

Admin controls:

Number

Message

Position

Icon

Color

Display pages

Schedule

Enable/disable

38. SECURITY

Security is critical.

Implement:

Secure authentication

Role-based permissions

CSRF protection where applicable

XSS protection

SQL injection prevention

Input validation

Output escaping

Rate limiting

Brute-force protection

Secure cookies

HTTP security headers

Content Security Policy where compatible

Server-side secret management

No API secret in frontend

Audit logs

Login activity

Session management

Admin timeout

Password policy

Optional 2FA

Secure webhook verification

Never trust client-side validation alone.

39. SHOPIFY WEBHOOKS

Implement secure webhook handling for relevant events such as:

Product updates

Inventory updates

Order creation

Order updates

Customer updates

Collection updates

Verify Shopify webhook signatures.

Log failures.

Retry failed webhook processing safely.

Avoid duplicate processing using idempotency.

40. CACHING

Implement intelligent caching where appropriate.

Cache:

Store settings

Navigation

CMS content

Collections

Products where safe

Invalidate cache after Admin changes.

Do not serve stale inventory/checkout-critical information where accuracy is required.

41. ERROR HANDLING

Create professional:

404 page

500 page

API error page

Shopify unavailable page

Empty search page

Empty collection page

Empty cart

Product unavailable

Out-of-stock

Network error

Admin should control user-facing messages.

42. RESPONSIVE DESIGN

Website must work perfectly on:

Mobile

Tablet

Laptop

Desktop

Large screens

Test all major components.

No horizontal overflow.

43. ACCESSIBILITY

Follow WCAG principles.

Implement:

Keyboard navigation

Focus states

ARIA where appropriate

Proper labels

Semantic HTML

Alt text

Color contrast

Accessible forms

Accessible menus

Screen-reader-friendly structure

44. PERFORMANCE

Target excellent Lighthouse scores.

Optimize:

LCP

CLS

INP

Image loading

Fonts

JavaScript bundle

API requests

Caching

Lazy loading

Code splitting

Avoid unnecessary third-party scripts.

45. ADMIN CONTENT PREVIEW

Before publishing content, allow:

Preview

Save draft

Publish

Unpublish

For homepage sections and pages, preview desktop/mobile where possible.

46. SCHEDULING

Allow Admin to schedule:

Homepage banners

Promotions

Announcement bars

Popups

Blog posts

Campaign sections

Featured content

Fields:

Start date/time

End date/time

Timezone

Status

47. DATABASE / CMS DESIGN

Create a scalable database structure for:

Users

Roles

Permissions

Settings

Theme settings

Pages

Page SEO

Homepage sections

Navigation

Menus

Media

Blog posts

Blog categories

FAQs

Testimonials

Popups

Banners

Redirects

Subscribers

Contact messages

Analytics settings

Tracking settings

Feature flags

Activity logs

Use proper indexes and relationships.

48. SETTINGS ARCHITECTURE

Create centralized settings management.

Every setting should have:

Key

Value

Type

Group

Description

Default value

Validation rules

Active/inactive

Support data types:

String

Text

Number

Boolean

JSON

Color

URL

Image

Select

Multi-select

This makes the system highly configurable without code changes.

49. ADMIN SEARCH

Global Admin search should search:

Products

Pages

Blog

Customers

Orders

FAQs

Media

Settings

50. AUDIT LOG

Log:

Login

Logout

Create

Update

Delete

Publish

Unpublish

Settings changes

Shopify configuration changes

User permission changes

Store:

User

Action

Module

Record

Timestamp

IP where legally appropriate

Before/after values where safe

51. DATA EXPORT

Admin should be able to export relevant CMS data as:

CSV

JSON

Do not export sensitive credentials/secrets.

52. ADMIN UI

Create a professional modern Admin UI.

Include:

Sidebar

Top navigation

Breadcrumbs

Search

Notifications

User menu

Responsive admin

Tables

Filters

Sorting

Pagination

Bulk actions

Confirmation dialogs

Toast notifications

Loading states

Empty states

53. FRONTEND PAGES

Create at minimum:

Home

Shop

Collection

Product

Search

Cart

Checkout redirect

Login

Register

Account

Orders

Wishlist if enabled

Blog

Blog article

About

Contact

FAQ

Privacy

Terms

Refund

Shipping

404

Pages must be dynamically controlled by CMS where appropriate.

54. SEO-FRIENDLY URL STRUCTURE

Use clean human-readable URLs.

Avoid unnecessary query parameters.

Use canonical URLs.

Ensure internal links are crawlable.

Create breadcrumbs.

Create XML sitemap.

Create robots controls.

55. INTERNAL LINKING

Admin/content system should support:

Related products

Related collections

Related blog posts

Breadcrumbs

Recommended pages

Create SEO-friendly internal linking.

56. MOBILE SEO

Ensure:

Same important content on mobile/desktop

Responsive layout

Fast mobile loading

Correct viewport

No intrusive popup behavior

Accessible mobile navigation

57. IMAGE SEO

Every CMS image must support:

ALT

Title

Caption

Compression

Responsive sizing

Do not use images without meaningful ALT text where appropriate.

58. ADMIN HELP TEXT

Every complicated setting should have:

Description

Example

Recommended value

Warning where necessary

This allows a non-developer Admin to manage the website.

59. NO CODE-CHANGE REQUIREMENT

The final system must be designed around this principle:

"Normal website management must never require editing source code."

Admin should be able to change:

Text

Images

Products

Menus

Colors

Fonts

Layout

Sections

SEO

Metadata

Ads

Analytics

Tracking IDs

Social links

Contact details

Pages

Blog

FAQs

Promotions

Popups

Header

Footer

Homepage

Redirects

Feature toggles

Legal content

Email settings

without developer intervention.

Only platform limitations, new third-party integrations, major architectural changes, or unsupported Shopify functionality may require development work.

60. SHOPIFY RESPONSIBILITY BOUNDARY

Clearly separate responsibilities.

CUSTOM ADMIN/CMS:

Website appearance

Website content

SEO

Marketing

CMS

Navigation

Theme

Homepage

Blog

Static pages

Analytics configuration

Tracking configuration

SHOPIFY ADMIN:

Products

Product variants

Inventory

Orders

Customers

Checkout

Payment methods

Shipping rates

Taxes

Shopify-specific discounts

Shopify commerce configuration

Do not duplicate Shopify's core functionality unnecessarily.

61. SEO DEFAULTS

Generate sensible SEO defaults automatically, but always allow Admin override.

Example:

Product meta title: {product_title} | {site_name}

Collection: {collection_title} | {site_name}

Blog: {post_title} | {site_name}

Never force these templates if Admin has manually entered custom metadata.

62. SEO VALIDATION

Create Admin SEO health checks.

Check:

Missing title

Missing meta description

Missing canonical

Missing ALT

Duplicate titles

Duplicate descriptions

Missing H1

Multiple H1 issues

Broken links where detectable

Missing schema

Noindex pages

Redirect chains where detectable

Show SEO score/status in Admin.

63. ADMIN SEO BULK MANAGEMENT

Allow bulk editing where practical:

Meta titles

Meta descriptions

ALT text

Index/noindex

Canonicals

Provide filters for missing SEO data.

64. COOKIE / CONSENT

Create configurable cookie/consent system where legally required.

Admin controls:

Banner text

Accept button

Reject button

Settings button

Categories

Privacy link

Position

Enable/disable

Tracking scripts must respect consent requirements where applicable.

65. TESTING

Before declaring the project complete, test:

Homepage

Product pages

Collection pages

Search

Cart

Checkout redirect

Login

Customer account

Forms

Admin authentication

Permissions

Shopify API

Webhooks

SEO metadata

Sitemap

Robots

Schema

Mobile

Desktop

Error states

Security

Performance

66. FINAL QA REQUIREMENT

Do not simply create UI mockups.

Build a functional production-ready system.

Every button must have a real action.

Every form must work.

Every Admin setting must actually affect the frontend.

Do not create fake dashboard data.

Do not create placeholder functionality disguised as completed functionality.

If a feature cannot be implemented because of Shopify/Lovable/platform limitations, clearly identify the limitation instead of pretending it works.

67. FINAL ACCEPTANCE CRITERIA

The project is complete only when:

Lovable storefront works.

Shopify products load dynamically.

Product pages work.

Collections work.

Search works.

Cart works.

Shopify checkout works.

Customer functionality works where supported.

Admin authentication works.

Role permissions work.

CMS works.

Homepage builder works.

Theme customizer works.

Header/footer are dynamic.

Navigation is dynamic.

SEO manager works.

Sitemap works.

Robots configuration works.

Schema works.

Redirect manager works.

Blog works.

FAQ works.

Media library works.

Analytics configuration works.

Ad configuration works.

Tracking IDs are not hard-coded.

Shopify secrets are never exposed.

Webhooks are verified.

Audit logs work.

Responsive design works.

Accessibility requirements are addressed.

Performance is optimized.

No normal website content requires source-code editing.

IMPORTANT:

Do not take shortcuts.

Do not hard-code business/content settings.

Do not expose secrets.

Do not build fake integrations.

Do not use mock data in production functionality.

Build the system as a real production-ready Headless Shopify Ecommerce + Admin CMS platform.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://awamzon.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6d8aca6d-f437-4382-a527-6eba11e43c8b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
