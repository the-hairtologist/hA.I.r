# Interaction Map - Complete UI Element Inventory

## Public Routes

### Landing Page (/)
| Element | Type | Expected Outcome | Priority |
|---------|------|------------------|----------|
| "Sign In" Button (outline) | Button | Navigate to /auth | P0 |
| "Get Started" Button | Button | Navigate to /auth | P0 |
| "Book Now" Button | Button | Navigate to /auth | P0 |
| Skip to content link | Link | Focus main content | A11Y |

### Auth Page (/auth)
| Element | Type | Expected Outcome | Priority |
|---------|------|------------------|----------|
| Sign In Form Submit | Form | Authenticate user → /dashboard | P0 |
| Sign Up Form Submit | Form | Create account → /dashboard | P0 |
| Password Reset Form Submit | Form | Send reset email | P1 |
| Email Input (Sign In) | Input | Accept valid email | P0 |
| Password Input (Sign In) | Input | Accept password | P0 |
| Email Input (Sign Up) | Input | Accept valid email | P0 |
| Password Input (Sign Up) | Input | Accept password (min requirements) | P0 |
| Full Name Input (Sign Up) | Input | Accept text | P0 |
| Skip to content link | Link | Focus main content | A11Y |

---

## Protected Routes - Shared (Both Roles)

### Dashboard (/dashboard)
| Element | Type | Expected Outcome | Priority |
|---------|------|------------------|----------|
| Sidebar Navigation Items | NavLink | Navigate to respective pages | P0 |
| User Account Dropdown | Dropdown | Show profile options | P1 |
| Sign Out Button | Button | Sign out → /auth | P0 |
| Feature Cards (multiple) | Card+Button | Navigate to feature pages | P0 |
| Quick Actions | Button | Execute quick actions | P1 |
| Recent Activity Items | Interactive | Click to view details | P1 |
| Todo List Items | Interactive | Mark complete/incomplete | P1 |
| Add Todo Form | Form | Create new todo | P1 |
| Recent Reviews (if stylist) | Interactive | View review details | P1 |
| Appointments List | Interactive | Click to view appointments | P1 |
| Skip to content link | Link | Focus main content | A11Y |
| Back to Dashboard button | Button | Navigate to /dashboard | P1 |

### Messages (/messages)
| Element | Type | Expected Outcome | Priority |
|---------|------|------------------|----------|
| Back Button | Button | Navigate to /dashboard | P0 |
| New Conversation Button | Button | Open conversation dialog | P1 |
| Conversation List Items | Interactive | Select conversation | P1 |
| Send Message Form | Form | Send message | P0 |
| Message Input | Textarea | Accept text input | P0 |
| Video Upload (optional) | Input | Accept video file | P2 |
| Skip to content link | Link | Focus main content | A11Y |

### Settings (/settings)
| Element | Type | Expected Outcome | Priority |
|---------|------|------------------|----------|
| Profile Tab | Tab | Show profile settings | P0 |
| Account Tab | Tab | Show account settings | P1 |
| Notifications Tab | Tab | Show notification settings | P1 |
| Save Profile Button | Button | Update profile data | P0 |
| Cancel Button | Button | Discard changes, reload data | P1 |
| Full Name Input | Input | Accept text | P0 |
| Email Input | Input | Display (readonly) | P0 |
| Phone Input | Input | Accept phone number | P1 |
| Gender Select | Select | Choose gender option | P2 |
| Avatar Upload | Input | Upload image file | P2 |
| Business Name Input (stylist) | Input | Accept text | P1 |
| Bio Textarea (stylist) | Textarea | Accept long text | P1 |
| Specialty Input (stylist) | Input | Accept text | P1 |
| Years Experience Input (stylist) | Input | Accept number | P1 |
| Color Line Input (stylist) | Input | Accept text | P2 |

### Resources (/resources)
| Element | Type | Expected Outcome | Priority |
|---------|------|------------------|----------|
| Back Button | Button | Navigate to /dashboard | P0 |
| "Go to AI Knowledge Hub" Button | Button | Navigate to /knowledge | P1 |
| Resource Category Tabs | Tab | Filter resources by category | P1 |
| Resource Cards | Card | Display resource info | P1 |
| Resource Links | Link | Open external URLs | P1 |
| Skip to content link | Link | Focus main content | A11Y |

### Knowledge (/knowledge)
| Element | Type | Expected Outcome | Priority |
|---------|------|------------------|----------|
| Back Button | Button | Navigate to /dashboard | P0 |
| AI Chat Submit | Form | Send AI prompt | P0 |
| AI Message Input | Textarea | Accept text input | P0 |
| Clear Chat Button | Button | Clear conversation history | P1 |
| Save Formula Button | Button | Open save dialog | P1 |
| Save Formula Dialog Submit | Button | Save AI-generated formula | P1 |
| Formula Name Input | Input | Accept text | P1 |
| Cancel Button | Button | Close dialog without saving | P1 |
| Skip to content link | Link | Focus main content | A11Y |

### Appointments (/appointments)
| Element | Type | Expected Outcome | Priority |
|---------|------|------------------|----------|
| Back Button | Button | Navigate to /dashboard | P0 |
| Calendar View Navigation | Button | Previous/Next month | P1 |
| Week View Navigation | Button | Previous/Next week | P1 |
| View Toggle (Calendar/List) | Toggle | Switch view modes | P1 |
| Appointment Cards | Interactive | View appointment details | P0 |
| Reschedule Button | Button | Open reschedule dialog | P1 |
| Cancel Appointment Button | Button | Open cancel confirmation | P1 |
| Appointment Details Modal | Modal | Show full appointment info | P1 |
| Skip to content link | Link | Focus main content | A11Y |

### Formulas (/formulas)
| Element | Type | Expected Outcome | Priority |
|---------|------|------------------|----------|
| Back Button | Button | Navigate to /dashboard | P0 |
| Generate New Formula Button | Button | Open formula creation dialog | P0 |
| Formula Cards | Card | Display saved formulas | P0 |
| Edit Formula Button | Button | Edit formula details | P1 |
| Delete Formula Button | Button | Delete formula (with confirmation) | P1 |
| Search/Filter Input | Input | Filter formula list | P1 |
| Formula Save Dialog | Dialog | Input formula details | P0 |
| Skip to content link | Link | Focus main content | A11Y |

### Integrations (/integrations)
| Element | Type | Expected Outcome | Priority |
|---------|------|------------------|----------|
| Back Button | Button | Navigate to /dashboard | P0 |
| Calendar Integration Cards | Card | Display integration status | P1 |
| Connect Calendar Button | Button | Initiate OAuth flow | P1 |
| Disconnect Calendar Button | Button | Remove integration | P1 |
| Skip to content link | Link | Focus main content | A11Y |

---

## Stylist-Only Routes

### Client Discovery (/client-discovery)
| Element | Type | Expected Outcome | Priority |
|---------|------|------------------|----------|
| Back Button | Button | Navigate to /dashboard | P0 |
| Client Request Cards | Card | Display client posts | P0 |
| Claim Request Button | Button | Claim client request | P0 |
| Filter Dropdown | Select | Filter by service type | P1 |
| View Client Profile Link | Link | View full client details | P1 |
| Skip to content link | Link | Focus main content | A11Y |

### Finance (/finance)
| Element | Type | Expected Outcome | Priority |
|---------|------|------------------|----------|
| Back Button | Button | Navigate to /dashboard | P0 |
| Payment Stats Cards | Card | Display financial metrics | P0 |
| Payment History Table | Table | Show payment records | P0 |
| Filter/Date Range Picker | Input | Filter payment data | P1 |
| Export Button | Button | Export payment data | P2 |
| Skip to content link | Link | Focus main content | A11Y |

### Schedule Management (/schedule)
| Element | Type | Expected Outcome | Priority |
|---------|------|------------------|----------|
| Back Button | Button | Navigate to /dashboard | P0 |
| Weekly Schedule Editor | Interactive | Set working hours | P0 |
| Day Toggle Switches | Switch | Enable/disable days | P0 |
| Time Pickers | Input | Set start/end times | P0 |
| Save Schedule Button | Button | Save schedule changes | P0 |
| Buffer Time Input | Input | Set buffer minutes | P1 |
| Blocked Dates Calendar | Interactive | Add blocked dates | P1 |
| Add Blocked Date Button | Button | Block specific dates | P1 |
| Remove Blocked Date Button | Button | Unblock dates | P1 |
| Skip to content link | Link | Focus main content | A11Y |

### Portfolio (/portfolio)
| Element | Type | Expected Outcome | Priority |
|---------|------|------------------|----------|
| Back Button | Button | Navigate to /dashboard | P0 |
| Back Button (top) | Button | Navigate back | P0 |
| Upload Photos Button | Button | Open file picker | P0 |
| Photo Upload Input | Input | Accept image files | P0 |
| Portfolio Image Grid | Grid | Display photos | P0 |
| Delete Photo Button | Button | Remove photo (with confirmation) | P1 |
| Reorder Photos Drag Handle | Drag | Reorder portfolio images | P1 |
| Before/After Toggle | Switch | Mark photo as before/after | P1 |
| Caption Input | Input | Add photo caption | P2 |
| Skip to content link | Link | Focus main content | A11Y |

### Clients (/clients)
| Element | Type | Expected Outcome | Priority |
|---------|------|------------------|----------|
| Back Button | Button | Navigate back | P0 |
| Back Button (header) | Button | Navigate to /formulas | P0 |
| Add Client Button | Button | Open add client dialog | P0 |
| Add Client Form | Form | Create new client | P0 |
| Client Name Input | Input | Accept text | P0 |
| Client Email Input | Input | Accept valid email | P0 |
| Client Phone Input | Input | Accept phone number | P1 |
| Client Search Input | Input | Filter client list | P1 |
| Client Cards | Card | Display client info | P0 |
| View Client Details Button | Button | View full client profile | P1 |
| Edit Client Button | Button | Edit client information | P1 |
| Edit Client Form Submit | Button | Update client data | P1 |
| Delete Client Button | Button | Delete client (with confirmation) | P2 |
| Skip to content link | Link | Focus main content | A11Y |

### Services (/services)
| Element | Type | Expected Outcome | Priority |
|---------|------|------------------|----------|
| Back Button | Button | Navigate to /dashboard | P0 |
| Add Service Button | Button | Open service creation form | P0 |
| Service Form | Form | Create new service | P0 |
| Service Name Input | Input | Accept text | P0 |
| Service Price Input | Input | Accept numeric value | P0 |
| Service Duration Input | Input | Accept minutes | P0 |
| Service Description Textarea | Textarea | Accept long text | P1 |
| Deposit Toggle | Switch | Enable/disable deposit | P1 |
| Deposit Amount Input | Input | Accept numeric value | P1 |
| Service List Items | Card | Display services | P0 |
| Edit Service Button | Button | Edit service details | P1 |
| Delete Service Button | Button | Delete service (with confirmation) | P1 |
| Toggle Active/Inactive | Switch | Enable/disable service | P1 |
| Skip to content link | Link | Focus main content | A11Y |

### Access Codes (/access-codes)
| Element | Type | Expected Outcome | Priority |
|---------|------|------------------|----------|
| Back Button | Button | Navigate to /dashboard | P0 |
| Access Code Form | Form | Redeem access code | P0 |
| Access Code Input | Input | Accept code text | P0 |
| Submit Code Button | Button | Validate and redeem code | P0 |
| Skip to content link | Link | Focus main content | A11Y |

---

## Client-Only Routes

### Client Requests (/client-requests)
| Element | Type | Expected Outcome | Priority |
|---------|------|------------------|----------|
| Back Button | Button | Navigate to /dashboard | P0 |
| Create Request Button | Button | Open request form | P0 |
| Request Form | Form | Submit hair request | P0 |
| Title Input | Input | Accept text | P0 |
| Description Textarea | Textarea | Accept long text | P0 |
| Service Type Select | Select | Choose service | P0 |
| Budget Range Input | Input | Accept text/range | P1 |
| Photo Upload | Input | Accept image files | P1 |
| Preferred Date Picker | Input | Select date | P1 |
| Location Input | Input | Accept text | P1 |
| Submit Request Button | Button | Create request | P0 |
| Request Cards | Card | Display active requests | P0 |
| View Request Details | Button | View full request | P1 |
| Delete Request Button | Button | Delete request (with confirmation) | P1 |
| Skip to content link | Link | Focus main content | A11Y |

### Book Appointment (/book-appointment)
| Element | Type | Expected Outcome | Priority |
|---------|------|------------------|----------|
| Back Button | Button | Navigate to /dashboard | P0 |
| Back Button (stylist selection) | Button | Navigate to /stylists | P1 |
| Stylist Selection | Interactive | Choose stylist | P0 |
| Service Selection | Select | Choose service | P0 |
| Date Picker | Interactive | Select appointment date | P0 |
| Time Slot Selection | Interactive | Choose available time | P0 |
| Notes Textarea | Textarea | Add appointment notes | P1 |
| Book Appointment Button | Button | Create appointment | P0 |
| Skip to content link | Link | Focus main content | A11Y |

### Stylist Discovery (/stylists)
| Element | Type | Expected Outcome | Priority |
|---------|------|------------------|----------|
| Back Button | Button | Navigate to /dashboard | P0 |
| Search Input | Input | Filter stylists | P1 |
| Location Filter | Select | Filter by location | P1 |
| Specialty Filter | Select | Filter by specialty | P1 |
| Rating Filter | Select | Filter by rating | P1 |
| Stylist Cards | Card | Display stylist profiles | P0 |
| View Profile Button | Button | Navigate to /stylist?id={id} | P0 |
| Book Appointment Button | Button | Navigate to booking with stylist | P0 |
| Skip to content link | Link | Focus main content | A11Y |

### Stylist Profile (/stylist)
| Element | Type | Expected Outcome | Priority |
|---------|------|------------------|----------|
| Back Button | Button | Navigate back | P0 |
| Book Appointment Button | Button | Navigate to booking flow | P0 |
| Portfolio Image Gallery | Gallery | View stylist photos | P1 |
| Reviews Section | Section | Display client reviews | P1 |
| Write Review Button (if eligible) | Button | Open review dialog | P1 |
| Contact Stylist Button | Button | Navigate to /messages | P1 |
| Skip to content link | Link | Focus main content | A11Y |

---

## Global Navigation Elements

### AppSidebar (Stylist View)
| Element | Type | Expected Outcome | Priority |
|---------|------|------------------|----------|
| Dashboard Link | NavLink | Navigate to /dashboard | P0 |
| Client Discovery Link | NavLink | Navigate to /client-discovery | P0 |
| Clients Link | NavLink | Navigate to /clients | P0 |
| Appointments Link | NavLink | Navigate to /appointments | P0 |
| Schedule Link | NavLink | Navigate to /schedule | P0 |
| Formulas Link | NavLink | Navigate to /formulas | P0 |
| Portfolio Link | NavLink | Navigate to /portfolio | P0 |
| Services Link | NavLink | Navigate to /services | P0 |
| Finance Link | NavLink | Navigate to /finance | P0 |
| Messages Link | NavLink | Navigate to /messages | P0 |
| Integrations Link | NavLink | Navigate to /integrations | P1 |
| Settings Link | NavLink | Navigate to /settings | P0 |
| Resources Link | NavLink | Navigate to /resources | P1 |
| Sidebar Collapse Toggle | Button | Toggle sidebar width | P1 |

### AppSidebar (Client View)
| Element | Type | Expected Outcome | Priority |
|---------|------|------------------|----------|
| Dashboard Link | NavLink | Navigate to /dashboard | P0 |
| Find Stylists Link | NavLink | Navigate to /stylists | P0 |
| My Requests Link | NavLink | Navigate to /client-requests | P0 |
| Appointments Link | NavLink | Navigate to /appointments | P0 |
| Formulas Link | NavLink | Navigate to /formulas | P0 |
| Messages Link | NavLink | Navigate to /messages | P0 |
| Settings Link | NavLink | Navigate to /settings | P0 |
| Resources Link | NavLink | Navigate to /resources | P1 |
| Sidebar Collapse Toggle | Button | Toggle sidebar width | P1 |

### MobileNav (Bottom Navigation)
| Element | Type | Expected Outcome | Priority |
|---------|------|------------------|----------|
| Mobile Nav Items (5-6) | Button | Navigate to respective pages | P0 |
| Active Page Highlight | Visual | Show current page | P1 |

---

## Common Dialog/Modal Components

### Profile Completion Dialog
| Element | Type | Expected Outcome | Priority |
|---------|------|------------------|----------|
| Next Step Button | Button | Advance to next step | P0 |
| Previous Step Button | Button | Go back to previous step | P0 |
| Avatar Upload | Input | Upload profile image | P1 |
| Complete Profile Button | Button | Finish onboarding → /dashboard | P0 |

### Confirm Dialog (Generic)
| Element | Type | Expected Outcome | Priority |
|---------|------|------------------|----------|
| Confirm Button | Button | Execute action | P0 |
| Cancel Button | Button | Close without action | P0 |

### Quick Appointment Dialog
| Element | Type | Expected Outcome | Priority |
|---------|------|------------------|----------|
| Client Select | Select | Choose client | P0 |
| Service Select | Select | Choose service | P0 |
| Date Picker | Input | Select date | P0 |
| Time Select | Input | Choose time | P0 |
| Save Appointment Button | Button | Create appointment | P0 |
| Cancel Button | Button | Close dialog | P1 |

### Reschedule Dialog
| Element | Type | Expected Outcome | Priority |
|---------|------|------------------|----------|
| New Date Picker | Input | Select new date | P0 |
| New Time Select | Input | Choose new time | P0 |
| Confirm Reschedule Button | Button | Update appointment | P0 |
| Cancel Button | Button | Close dialog | P1 |

### Review Dialog
| Element | Type | Expected Outcome | Priority |
|---------|------|------------------|----------|
| Rating Input (1-5 stars) | Interactive | Select rating | P0 |
| Review Text Textarea | Textarea | Write review text | P0 |
| Submit Review Button | Button | Post review | P0 |
| Cancel Button | Button | Close dialog | P1 |

### Service Type Color Manager
| Element | Type | Expected Outcome | Priority |
|---------|------|------------------|----------|
| Add Service Type Button | Button | Open add dialog | P1 |
| Color Picker | Input | Choose color | P1 |
| Service Type Input | Input | Enter service name | P1 |
| Save Button | Button | Save color mapping | P1 |
| Cancel Button | Button | Close dialog | P1 |

---

## Priority Legend
- **P0**: Critical user flow - must work
- **P1**: Important feature - should work reliably
- **P2**: Nice-to-have - can have minor issues
- **A11Y**: Accessibility feature
