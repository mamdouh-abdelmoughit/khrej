Phase 2: Replace all mock data with real Supabase integration.
Do these in exact order:

1. HOMEPAGE — Live data from Supabase
- Fetch all events where status = 'published' from Supabase
- City filter buttons filter events client-side by venue_city
- Event card shows: cover_image_url, title, venue_city, event_date, 
  ticket_price, and (ticket_quantity - tickets_sold) remaining
- If no events exist yet, show a clean empty state: 
  "Aucun événement pour le moment — revenez bientôt 👀"

2. EVENT DETAIL PAGE — Live data
- Fetch single event by id from Supabase
- Show all real fields: title, description, cover_image_url, 
  venue_name, venue_city, event_date, ticket_price
- Calculate platform fee: ticket_price * 0.05
- Calculate total: ticket_price + platform_fee
- Tickets remaining: ticket_quantity - tickets_sold
- Progress bar: tickets_sold / ticket_quantity
- If tickets_sold >= ticket_quantity: show "Complet", disable button

3. ORGANIZER — Event creation with real Supabase insert
- /organizer/events/new form submits to Supabase events table
- Cover image uploads to Supabase Storage bucket called 'event-covers'
- After successful insert, redirect to /organizer/dashboard
- Set status as 'published' by default for MVP
- Set tickets_sold to 0 on creation

4. ORGANIZER REGISTER — Real role update
- /organizer/register form updates the profiles table
- Sets role = 'organizer' for the logged in user
- After success redirect to /organizer/dashboard

5. ORGANIZER DASHBOARD — Real data
- Fetch all events where organizer_id = logged in user id
- Show total revenue: sum of (orders.total_paid) for all their events
- Show total tickets sold: sum of tickets_sold across all their events
- Each event card shows: title, tickets_sold, ticket_quantity, revenue

6. CHECKOUT — Real order creation + QR code + email
- On "Payer maintenant" click:
  a. Check tickets_sold < ticket_quantity (prevent overselling)
  b. Insert new order into orders table with status = 'paid' 
     (skip real payment for now, we add CMI later)
  c. Increment tickets_sold on the event by 1 using Supabase RPC 
     to avoid race conditions
  d. Generate a unique QR code string (use crypto.randomUUID())
  e. Generate QR code image using 'qrcode' npm package
  f. Send confirmation email via Resend with:
     - Subject: "Ton ticket Khrej — [Event Title]"
     - Body: event name, date, venue, buyer name
     - QR code image embedded in email
  g. Redirect to /confirmation with order details

7. ORGANIZER EVENT DETAIL — Real attendees
- Fetch all orders where event_id matches, status = 'paid'
- Show attendee list: buyer_name, buyer_email, buyer_phone, qr_code
- Show real revenue and tickets sold metrics

IMPORTANT NOTES:
- Always check auth session before any organizer page — 
  redirect to /auth/login if not logged in
- Always check role = 'organizer' before organizer pages — 
  redirect to / if not organizer
- Use Supabase service role key only in API routes, never client side
- Handle all errors gracefully with toast notifications
- Keep all amounts in MAD with 2 decimal places

After each item is done, confirm and move to the next.
Start with item 1.