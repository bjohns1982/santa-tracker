# SMS Implementation Summary

## ✅ What's Been Implemented

### Backend Changes

1. **Database Schema Updates**
   - Added `phoneNumber1`, `phoneNumber2`, and `smsOptIn` fields to `Family` model
   - Added `SKIPPED` status to `VisitStatus` enum
   - Added `smsResponse` and `smsResponseAt` fields to `Visit` model
   - Migration created and applied: `add_sms_phone_numbers_and_skipped_status`

2. **Phone Number Validation Service** (`backend/src/services/phoneValidation.ts`)
   - Validates phone numbers in +1XXXXXXXXXX format
   - Formats phone numbers for storage
   - Formats phone numbers for display

3. **Twilio Service** (`backend/src/services/twilio.ts`)
   - Sends SMS messages via Twilio
   - Handles errors gracefully

4. **SMS Message Templates** (`backend/src/services/smsTemplates.ts`)
   - Tour start message with app link
   - On-deck message with ETA

5. **SMS Service** (`backend/src/services/smsService.ts`)
   - `sendTourStartMessages()`: Sends messages to all families when tour starts
   - `sendOnDeckMessage()`: Sends ETA message when family is next
   - `parseSMSResponse()`: Parses incoming SMS for keywords (SKIP, NOT HOME, CANCEL)
   - `handleSMSResponse()`: Processes incoming SMS and marks visit as SKIPPED

6. **SMS Webhook Route** (`backend/src/routes/sms.ts`)
   - `/api/sms/webhook`: Receives incoming SMS from Twilio
   - `/api/sms/status`: Receives delivery status updates (optional)

7. **Updated Routes**
   - **visits.ts**: 
     - Handles SKIPPED status
     - Sends on-deck messages when visit status changes to VISITING
     - Added `/api/visits/:visitId/skip` endpoint for manual skipping
     - Updated requeue to clear SMS response data
   - **tours.ts**: 
     - Triggers SMS messages when tour status changes to ACTIVE
     - Updated family order update to handle SKIPPED visits
   - **families.ts**: 
     - Accepts phone numbers and SMS opt-in during sign-up and updates
     - Validates phone numbers when SMS opt-in is enabled

### Frontend Changes

1. **Phone Number Input Component** (`frontend/src/components/Shared/PhoneNumberInput.tsx`)
   - Auto-formats phone numbers as user types
   - Validates format (+1XXXXXXXXXX)
   - Shows error messages

2. **Family Sign-Up Form** (`frontend/src/pages/FamilySignUp.tsx`)
   - Added SMS opt-in toggle
   - Added primary and secondary phone number inputs
   - Phone numbers required when SMS opt-in is enabled
   - Validates phone numbers before submission

3. **Family Edit Modal** (`frontend/src/components/FamilyEditModal.tsx`)
   - Added SMS opt-in toggle
   - Added phone number inputs
   - Same validation as sign-up form

4. **Tour Guide Dashboard** (`frontend/src/pages/TourGuideDashboard.tsx`)
   - Added "Skipped Visits" section (separate from "Completed Visits")
   - Displays SMS responses in skipped visits
   - Shows SMS opt-in indicators (📱 icon) in family roster
   - Real-time updates when visits are skipped via SMS

5. **Draggable Family List** (`frontend/src/components/Shared/DraggableFamilyList.tsx`)
   - Shows SMS indicator (📱) for families with SMS opt-in enabled

6. **API Service** (`frontend/src/services/api.ts`)
   - Updated `createFamily` and `updateFamily` to include phone numbers and SMS opt-in

## 🔧 Configuration Required

### 1. Environment Variables

Add to `backend/.env`:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+15551234567
FRONTEND_URL=http://localhost:5173
```

### 2. Twilio Setup

Follow the instructions in `TWILIO_SETUP.md` to:
- Enable SMS on your Twilio phone number
- Configure the webhook URL (use ngrok for local testing)
- Test the integration

### 3. ngrok Setup (for Local Testing)

1. Install ngrok: `brew install ngrok` (macOS) or download from https://ngrok.com
2. Start backend: `cd backend && npm run dev`
3. Start ngrok: `ngrok http 3001`
4. Copy the HTTPS URL and use it in Twilio webhook configuration

## 📱 How It Works

### Tour Start Flow

1. Tour guide clicks "Start Tour"
2. Backend sends SMS to all families with `smsOptIn = true`
3. Message includes tour name and link to tracking page

### On-Deck Flow

1. Tour guide clicks "Arrive" at a house
2. Visit status changes to VISITING
3. Backend checks if next family has SMS opt-in
4. If yes, sends on-deck message with ETA (5 minutes per visit)

### SMS Response Flow

1. Family receives on-deck message
2. Family replies with SKIP, NOT HOME, or CANCEL
3. Twilio sends webhook to `/api/sms/webhook`
4. Backend parses response and marks visit as SKIPPED
5. Visit moves to "Skipped Visits" section
6. Tour guide sees the SMS response in the dashboard
7. Next visit automatically becomes ON_WAY

### Requeue Flow

1. Tour guide clicks "Add Back to Roster" on a skipped visit
2. Visit status changes to PENDING
3. SMS response data is cleared
4. Visit appears back in active roster

## 🧪 Testing Checklist

- [ ] Add Twilio credentials to `.env`
- [ ] Set up ngrok and configure Twilio webhook
- [ ] Create a tour
- [ ] Add a family with SMS opt-in enabled
- [ ] Start the tour (should send SMS)
- [ ] Reply to SMS with "SKIP" (should mark visit as skipped)
- [ ] Check tour guide dashboard (should show skipped visit with SMS response)
- [ ] Click "Add Back to Roster" (should move visit back to active)
- [ ] Test on-deck message (arrive at a house, next family should receive SMS)

## 📝 Notes

- Phone numbers are stored in +1XXXXXXXXXX format (11 characters)
- SMS opt-in is optional - families can sign up without it
- If SMS opt-in is enabled, at least one phone number is required
- Secondary phone number is optional
- Skipped visits are separate from completed visits
- SMS responses are stored and displayed to tour guide
- All SMS sending is asynchronous (doesn't block tour operations)

## 🐛 Known Issues / Future Improvements

- Delivery status tracking could be stored in database
- Retry logic for failed SMS sends
- SMS message customization per tour
- Bulk SMS sending with rate limiting
- SMS opt-out functionality

