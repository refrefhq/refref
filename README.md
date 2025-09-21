# InflaMed Affiliates - Referral Tracking System

A comprehensive referral tracking and commission management system for the InflaMed/Continua platform, designed to integrate with existing Stripe payment processing and sales infrastructure.

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20
- pnpm (package manager)
- PostgreSQL (recommended for production)

### Development Setup

1. **Clone and Install**

   ```bash
   git clone <repository-url>
   cd inflamed-affiliates
   pnpm install
   ```

2. **Start Development** (That's it!)

   ```bash
   pnpm dev
   ```

   The system automatically:

   - ✅ Sets up Firebase Firestore (zero-config database)
   - ✅ Configures all environment variables
   - ✅ Builds required packages
   - ✅ Starts all development servers

### 🌐 Available Services

- **Marketing Site**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3001
- **Attribution Script Demo**: http://localhost:5173
- **Referral Widget Demo**: http://localhost:5174

### 📁 Project Structure

```
├── apps/
│   ├── admin/          # Admin dashboard (Next.js)
│   └── www/            # Marketing site (Next.js)
├── packages/
│   ├── attribution-script/  # Referral tracking script
│   ├── referral-widget/     # Embeddable referral widget
│   ├── types/               # Shared TypeScript types
│   ├── ui/                  # Shared UI components
│   └── coredb/              # Database schema
└── packages/
```

## ✅ Current Status

**Working Features:**

- ✅ Development environment setup
- ✅ Marketing website with referral program showcase
- ✅ Admin dashboard with authentication
- ✅ Attribution script for tracking referrals
- ✅ Referral widget for embedding
- ✅ Environment configuration
- ✅ Package builds and module resolution

**Next Steps:**

- 🔄 Database setup and configuration
- 🔄 Stripe integration for commission tracking
- 🔄 User authentication and management
- 🔄 Referral program configuration

## 🔥 Database Setup

### Recommended: Firebase Firestore

**Why Firebase Firestore?**

- ✅ **Zero-config**: No database server to set up
- ✅ **Familiar**: Your team already knows Firebase
- ✅ **Real-time**: Perfect for referral tracking
- ✅ **Scalable**: Handles growth automatically
- ✅ **Free tier**: Generous limits for development

### Setup Options (Choose One)

#### Option 1: Zero-Config Firebase (Default - Recommended)

**This is the current setup and works immediately!** No Firebase project setup required.

The system automatically uses Firebase's development mode, which:

- ✅ Works out of the box
- ✅ No authentication required
- ✅ Perfect for referral tracking
- ✅ Easy to switch to real Firebase later

**Current setup (already configured):**

```bash
# Already configured in apps/admin/.env.local
DATABASE_URL="firebase:inflamed-affiliates-dev"
```

**That's it!** Just run `pnpm dev` and everything works.

#### Option 2: Real Firebase Project (For Production)

If you want to use a real Firebase project for production:

1. **Create Firebase Project:**

   ```bash
   # Install Firebase CLI
   npm install -g firebase-tools

   # Login to Firebase
   firebase login

   # Create new project
   firebase projects:create your-project-name
   ```

2. **Enable Firestore:**

   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Enable Firestore Database
   - Set up security rules

3. **Update Environment Variables:**
   ```bash
   # Update apps/admin/.env.local
   DATABASE_URL="firebase:your-project-id"
   NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
   NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
   # ... other Firebase config
   ```

#### Option 3: Firebase Emulator (Advanced)

For advanced development with Firebase features:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Initialize Firebase in your project
firebase init emulators

# Start the emulator
firebase emulators:start --only firestore
```

#### Option 2: Local PostgreSQL Installation

**macOS (using Homebrew):**

```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Create database and user
createdb inflamed_affiliates
psql inflamed_affiliates -c "CREATE USER inflamed WITH PASSWORD 'secure_password123';"
psql inflamed_affiliates -c "GRANT ALL PRIVILEGES ON DATABASE inflamed_affiliates TO inflamed;"
```

**Environment Variables:**

```bash
DATABASE_URL="postgresql://inflamed:secure_password123@localhost:5432/inflamed_affiliates"
```

#### Option 3: Cloud Providers (Production Ready)

**Supabase (Recommended for Production):**

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string from Settings > Database
4. Update `DATABASE_URL` in your environment

**Neon (Serverless PostgreSQL):**

1. Go to [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string
4. Update `DATABASE_URL` in your environment

**Railway:**

1. Go to [railway.app](https://railway.app)
2. Create new PostgreSQL service
3. Copy connection string
4. Update `DATABASE_URL` in your environment

### Database Schema & Migrations

The project uses Drizzle ORM with schema defined in `packages/coredb/src/schema.ts`.

**Run migrations:**

```bash
# Generate migration files
pnpm --filter @refref/coredb db:generate

# Apply migrations to database
pnpm --filter @refref/coredb db:migrate

# Seed database (if available)
pnpm --filter @refref/coredb db:seed
```

### Troubleshooting

**Common Issues:**

1. **"role does not exist" error:**

   - Make sure the user exists in PostgreSQL
   - Check username/password in DATABASE_URL

2. **Connection refused:**

   - Ensure PostgreSQL is running
   - Check port 5432 is not blocked
   - Verify DATABASE_URL format

3. **Docker container not starting:**
   - Check if port 5432 is already in use
   - Remove existing container: `docker rm inflamed-postgres`
   - Try different port: `-p 5433:5432`

**Verify Connection:**

```bash
# Test connection
psql "postgresql://inflamed:secure_password123@localhost:5432/inflamed_affiliates"

# Or using Docker
docker exec -it inflamed-postgres psql -U inflamed -d inflamed_affiliates
```

## Overview

This system enables tracking of referral sales, calculating commissions based on net sales after grace periods, and managing automated payouts to affiliates. It leverages the existing Stripe integration and platform fee structure already implemented in the main InflaMed application.

## Current InflaMed Infrastructure Analysis

### Existing Payment & Sales Infrastructure

Based on analysis of the main InflaMed codebase, the following infrastructure is already in place:

#### 1. Stripe Integration

- **API Endpoints**: `/stripeProxy/v1/*` endpoints for payment processing
- **Key Endpoints**:
  - `processStripePayment` - Process payments
  - `createSubscriptionCheckout` - Create subscription checkouts
  - `getUserSubscription` - Retrieve subscription data
  - `getStripeBalance` - Get account balance
  - `createManualPayout` - Manual payout functionality
  - `configureAutomaticPayouts` - Automatic payout configuration

#### 2. Subscription Tiers & Pricing

- **Three Tiers**: BASIC ($139/mo), PLUS ($379/mo), PRO ($899/mo)
- **Platform Fees**: 15% (BASIC), 12% (PLUS), 10% (PRO) - Early Adopter rates
- **Revenue Streams**: Subscription fees + platform fees on guidance programs
- **Currency**: AUD (Australian Dollars)

#### 3. Revenue Tracking

- Platform fees are calculated on guidance program revenue
- Existing commission structure: Platform takes 10-15% of revenue
- Net sales calculation already implemented in pricing calculators

## Technical Architecture Recommendations

### Database Choice Analysis

Given your existing Firebase Firestore infrastructure, here are the three options:

#### Option 1: **Same Firebase Project (Recommended)**

- **Pros**:
  - Leverages existing authentication and infrastructure
  - No additional database costs
  - Seamless integration with existing user system
  - Real-time updates for affiliate dashboards
- **Cons**:
  - Firestore pricing can scale with reads/writes
  - Less structured than SQL for complex queries

#### Option 2: **Separate Firebase Project**

- **Pros**:
  - Isolated affiliate system
  - Separate billing and scaling
  - Can use different Firebase features
- **Cons**:
  - Additional project management overhead
  - Cross-project data access complexity

#### Option 3: **MongoDB Atlas**

- **Pros**:
  - Flat pricing structure ($57/month for M10 cluster)
  - Better for complex queries and analytics
  - More cost-effective for high-volume data
- **Cons**:
  - Additional database to manage
  - Need to handle authentication separately

**Recommendation**: Use **Option 2** (Separate Firebase Project) for the affiliate system. Here's why:

**Why Separate Firebase Project is Better:**

1. **Separation of Concerns**: Affiliate system is completely separate from regulated healthcare offerings
2. **Regulatory Compliance**: Keeps affiliate data isolated from clinical data
3. **Independent Scaling**: Can scale affiliate system without affecting main app
4. **Team Familiarity**: Still uses Firebase (your team knows it)
5. **Cost-Effective**: ~$0.10/month for small affiliate system
6. **Independent Deployments**: Can update affiliate system without touching main app
7. **Security Isolation**: Different security rules and access controls
8. **Audit Trail**: Clear separation for compliance and auditing

**Cost Analysis:**

- **Separate Firebase Project**: ~$0.10/month for 100 affiliates, 1,000 referrals/month
- **MongoDB Atlas M10**: $57/month fixed cost
- **Same Firebase Project**: ~$0.10/month but mixed with clinical data

**When to Consider MongoDB:**

- If you reach 500,000+ operations/month (very large affiliate program)
- If you need complex analytics queries that Firestore can't handle

### 1. Database Schema (Separate Firebase Project)

For the affiliate system, we'll create a separate Firebase project to keep affiliate data completely isolated from your regulated healthcare offerings:

```typescript
// Firestore Collections Structure

// Collection: affiliates
interface Affiliate {
  id: string; // Document ID
  userId: string; // References Firebase user ID (from main app)
  email: string; // Affiliate email for communication
  name: string; // Affiliate name
  affiliateCode: string; // Unique referral code (e.g., "INFABC123")
  commissionRate: number; // 0.10 = 10%
  gracePeriodDays: number; // Default 30 days
  status: "active" | "suspended" | "terminated";
  stripeAccountId?: string; // For payouts
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Collection: referrals
interface Referral {
  id: string; // Document ID
  affiliateId: string; // References affiliate document ID
  referredUserId: string; // References Firebase user ID (from main app)
  referredUserEmail: string; // Email of referred user
  referralCode: string; // The code used
  status: "pending" | "converted" | "expired";
  conversionDate?: Timestamp;
  subscriptionId?: string; // Stripe subscription ID
  createdAt: Timestamp;
}

// Collection: commissions
interface Commission {
  id: string; // Document ID
  affiliateId: string; // References affiliate document ID
  referralId: string; // References referral document ID
  subscriptionId: string; // Stripe subscription ID
  grossAmount: number; // In cents (AUD)
  platformFee: number; // In cents
  netAmount: number; // In cents
  commissionRate: number; // 0.10 = 10%
  commissionAmount: number; // In cents
  gracePeriodEnd: Timestamp;
  status: "pending" | "cleared" | "paid" | "cancelled";
  payoutId?: string; // Stripe payout ID
  createdAt: Timestamp;
  paidAt?: Timestamp;
}

// Collection: payouts
interface Payout {
  id: string; // Document ID
  affiliateId: string; // References affiliate document ID
  stripePayoutId: string; // Stripe transfer ID
  amount: number; // In cents
  currency: string; // 'AUD'
  status: "pending" | "paid" | "failed";
  commissionIds: string[]; // Array of commission document IDs
  createdAt: Timestamp;
  paidAt?: Timestamp;
}

// Firestore Security Rules (for separate affiliate project)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Affiliates collection - only authenticated users can access their own data
    match /affiliates/{affiliateId} {
      allow read, write: if request.auth != null
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null
        && request.auth.uid == request.resource.data.userId;
    }

    // Referrals collection - public read for validation, authenticated write
    match /referrals/{referralId} {
      allow read: if true; // Public read for referral code validation
      allow create: if request.auth != null;
      allow update: if false; // Only server-side updates
    }

    // Commissions collection - only affiliate can read their commissions
    match /commissions/{commissionId} {
      allow read: if request.auth != null
        && request.auth.uid == resource.data.affiliateId;
      allow write: if false; // Only server-side writes
    }

    // Payouts collection - only affiliate can read their payouts
    match /payouts/{payoutId} {
      allow read: if request.auth != null
        && request.auth.uid == resource.data.affiliateId;
      allow write: if false; // Only server-side writes
    }
  }
}
```

### 2. API Integration Points

#### A. Webhook Integration

Extend existing Stripe webhook handling to track referral conversions:

```typescript
// New webhook events to handle
const REFERRAL_WEBHOOK_EVENTS = [
  "customer.subscription.created",
  "customer.subscription.updated",
  "invoice.payment_succeeded",
  "invoice.payment_failed",
];

// Integration with existing webhook handler
export async function handleStripeWebhook(event: Stripe.Event) {
  switch (event.type) {
    case "customer.subscription.created":
      await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
      break;
    case "invoice.payment_succeeded":
      await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
      break;
    // ... existing handlers
  }
}
```

#### B. Referral Code Generation

```typescript
// Generate unique referral codes
export function generateReferralCode(affiliateId: string): string {
  const prefix = "INF";
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${randomSuffix}`;
}

// Validate referral codes
export async function validateReferralCode(
  code: string
): Promise<Affiliate | null> {
  // Check if code exists and affiliate is active
  const affiliatesRef = collection(db, "affiliates");
  const q = query(
    affiliatesRef,
    where("affiliateCode", "==", code),
    where("status", "==", "active")
  );
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) return null;

  const doc = querySnapshot.docs[0];
  return { id: doc.id, ...doc.data() } as Affiliate;
}
```

### 3. Commission Calculation Logic

```typescript
interface CommissionCalculation {
  grossAmount: number;
  platformFee: number;
  netAmount: number;
  commissionRate: number;
  commissionAmount: number;
}

export function calculateCommission(
  subscription: Stripe.Subscription,
  affiliate: Affiliate,
  platformFeeRate: number
): CommissionCalculation {
  const grossAmount =
    subscription.items.data.reduce((total, item) => {
      return total + (item.price.unit_amount || 0);
    }, 0) / 100; // Convert from cents

  const platformFee = grossAmount * platformFeeRate;
  const netAmount = grossAmount - platformFee;
  const commissionAmount = netAmount * affiliate.commission_rate;

  return {
    grossAmount,
    platformFee,
    netAmount,
    commissionRate: affiliate.commission_rate,
    commissionAmount,
  };
}
```

### 4. Grace Period Management

```typescript
export class GracePeriodManager {
  async checkGracePeriods(): Promise<void> {
    // Query all pending commissions where grace period has ended
    const commissionsRef = collection(db, "commissions");
    const q = query(
      commissionsRef,
      where("status", "==", "pending"),
      where("gracePeriodEnd", "<=", new Date())
    );
    const querySnapshot = await getDocs(q);

    for (const doc of querySnapshot.docs) {
      await this.clearCommission(doc.id);
    }
  }

  async clearCommission(commissionId: string): Promise<void> {
    const commissionRef = doc(db, "commissions", commissionId);
    await updateDoc(commissionRef, { status: "cleared" });
  }
}
```

### 5. Payout Processing

```typescript
export class PayoutProcessor {
  async processPayouts(): Promise<void> {
    // Get all affiliates
    const affiliatesRef = collection(db, "affiliates");
    const affiliatesSnapshot = await getDocs(affiliatesRef);

    for (const affiliateDoc of affiliatesSnapshot.docs) {
      const affiliate = {
        id: affiliateDoc.id,
        ...affiliateDoc.data(),
      } as Affiliate;

      // Get cleared commissions for this affiliate
      const commissionsRef = collection(db, "commissions");
      const q = query(
        commissionsRef,
        where("affiliateId", "==", affiliate.id),
        where("status", "==", "cleared")
      );
      const commissionsSnapshot = await getDocs(q);

      if (!commissionsSnapshot.empty) {
        const commissions = commissionsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Commission[];

        await this.processAffiliatePayout(affiliate, commissions);
      }
    }
  }

  private async processAffiliatePayout(
    affiliate: Affiliate,
    commissions: Commission[]
  ): Promise<void> {
    const totalAmount = commissions.reduce(
      (sum, c) => sum + c.commissionAmount,
      0
    );

    // Create Stripe payout
    const payout = await stripe.transfers.create({
      amount: totalAmount, // Already in cents
      currency: "aud",
      destination: affiliate.stripeAccountId!,
      metadata: {
        affiliate_id: affiliate.id,
        commission_count: commissions.length.toString(),
      },
    });

    // Update database
    await this.recordPayout(affiliate.id, payout.id, totalAmount, commissions);
  }
}
```

## Integration with Existing System

### 1. Frontend Integration

#### A. Referral Code Input

Add to existing registration/checkout flow:

```typescript
// In registration form
const ReferralCodeInput: React.FC = () => {
  const [referralCode, setReferralCode] = useState("");
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const validateCode = async (code: string) => {
    const response = await fetch(`${API_ENDPOINT}/affiliates/validate/${code}`);
    const result = await response.json();
    setIsValid(result.valid);
  };

  return (
    <TextField
      label="Referral Code (Optional)"
      value={referralCode}
      onChange={(e) => {
        setReferralCode(e.target.value);
        if (e.target.value.length >= 6) {
          validateCode(e.target.value);
        }
      }}
      error={isValid === false}
      helperText={isValid === false ? "Invalid referral code" : ""}
    />
  );
};
```

#### B. Affiliate Dashboard

Create new page for affiliate management:

```typescript
// pages/affiliate/dashboard.tsx
export default function AffiliateDashboard() {
  const { data: stats } = useAffiliateStats();
  const { data: commissions } = useCommissions();
  const { data: payouts } = usePayouts();

  return (
    <Container>
      <Typography variant="h4">Affiliate Dashboard</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Commissions</Typography>
              <Typography variant="h4">
                ${stats?.totalCommissions || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Pending Payouts</Typography>
              <Typography variant="h4">
                ${stats?.pendingPayouts || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Referral Code</Typography>
              <Typography variant="h6">{stats?.referralCode}</Typography>
              <Button onClick={copyReferralLink}>Copy Link</Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <CommissionsTable data={commissions} />
      <PayoutsTable data={payouts} />
    </Container>
  );
}
```

### 2. Backend Integration

#### A. Extend Existing API

Add new endpoints to existing API structure:

```typescript
// New API routes
app.post("/affiliates/register", authenticateUser, registerAffiliate);
app.get("/affiliates/validate/:code", validateReferralCode);
app.get("/affiliates/dashboard", authenticateUser, getAffiliateDashboard);
app.get("/affiliates/commissions", authenticateUser, getCommissions);
app.get("/affiliates/payouts", authenticateUser, getPayouts);
app.post("/affiliates/payouts/request", authenticateUser, requestPayout);
```

#### B. Database Integration

Create separate Firebase project for affiliate system:

```typescript
// firebase/affiliateApp.ts - Separate Firebase project
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const affiliateFirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_AFFILIATE_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_AFFILIATE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_AFFILIATE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_AFFILIATE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId:
    process.env.NEXT_PUBLIC_AFFILIATE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_AFFILIATE_FIREBASE_APP_ID,
};

const affiliateApp = initializeApp(affiliateFirebaseConfig, "affiliate");
export const affiliateDb = getFirestore(affiliateApp);

// services/AffiliateService.ts
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { affiliateDb } from "@/firebase/affiliateApp";

export class AffiliateService {
  static async createAffiliate(
    userId: string,
    data: Partial<Affiliate>
  ): Promise<string> {
    const affiliatesRef = collection(affiliateDb, "affiliates");
    const docRef = await addDoc(affiliatesRef, {
      userId,
      affiliateCode: generateReferralCode(userId),
      commissionRate: 0.1, // 10% default
      gracePeriodDays: 30,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    });
    return docRef.id;
  }

  static async getAffiliate(affiliateId: string): Promise<Affiliate | null> {
    const docRef = doc(affiliateDb, "affiliates", affiliateId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Affiliate;
    }
    return null;
  }

  static async getAffiliateByUserId(userId: string): Promise<Affiliate | null> {
    const affiliatesRef = collection(affiliateDb, "affiliates");
    const q = query(affiliatesRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) return null;

    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Affiliate;
  }

  static async getAffiliateByCode(code: string): Promise<Affiliate | null> {
    const affiliatesRef = collection(affiliateDb, "affiliates");
    const q = query(
      affiliatesRef,
      where("affiliateCode", "==", code),
      where("status", "==", "active")
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) return null;

    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Affiliate;
  }

  // Commission tracking
  static async createCommission(
    commission: Omit<Commission, "id">
  ): Promise<string> {
    const commissionsRef = collection(affiliateDb, "commissions");
    const docRef = await addDoc(commissionsRef, {
      ...commission,
      createdAt: new Date(),
    });
    return docRef.id;
  }

  static async getCommissionsByAffiliate(
    affiliateId: string
  ): Promise<Commission[]> {
    const commissionsRef = collection(affiliateDb, "commissions");
    const q = query(
      commissionsRef,
      where("affiliateId", "==", affiliateId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Commission[];
  }

  // Analytics (using Firestore's aggregation capabilities)
  static async getAffiliateStats(affiliateId: string) {
    const commissionsRef = collection(affiliateDb, "commissions");
    const q = query(commissionsRef, where("affiliateId", "==", affiliateId));
    const querySnapshot = await getDocs(q);

    const commissions = querySnapshot.docs.map((doc) =>
      doc.data()
    ) as Commission[];

    // Calculate stats client-side (for small datasets, this is fine)
    const stats = {
      totalCommissions: commissions.length,
      pendingAmount: commissions
        .filter((c) => c.status === "pending")
        .reduce((sum, c) => sum + c.commissionAmount, 0),
      paidAmount: commissions
        .filter((c) => c.status === "paid")
        .reduce((sum, c) => sum + c.commissionAmount, 0),
      totalAmount: commissions.reduce((sum, c) => sum + c.commissionAmount, 0),
    };

    return stats;
  }
}
```

### 3. Stripe Integration

#### A. Webhook Extensions

Extend existing webhook handler:

```typescript
// In existing webhook handler
export async function handleWebhook(event: Stripe.Event) {
  // Existing webhook handling...

  // Add referral tracking
  if (event.type === "customer.subscription.created") {
    await trackReferralConversion(event.data.object as Stripe.Subscription);
  }

  if (event.type === "invoice.payment_succeeded") {
    await processCommissionPayment(event.data.object as Stripe.Invoice);
  }
}
```

#### B. Payout Integration

Use existing payout infrastructure:

```typescript
// Leverage existing payout settings
export async function createAffiliatePayout(
  affiliateId: string,
  amount: number
): Promise<Stripe.Transfer> {
  const affiliate = await getAffiliate(affiliateId);

  return await stripe.transfers.create({
    amount: Math.round(amount * 100),
    currency: "aud",
    destination: affiliate.stripeAccountId,
    metadata: {
      type: "affiliate_commission",
      affiliate_id: affiliateId,
    },
  });
}
```

## Business Logic Implementation

### 1. Commission Rates

- **Default Rate**: 10% of net sales (after platform fees)
- **Tiered Rates**: Higher rates for top performers
- **Minimum Payout**: $50 AUD minimum before payout

### 2. Grace Period

- **Default**: 30 days from subscription start
- **Purpose**: Ensure subscription stability before paying commissions
- **Configurable**: Per affiliate basis

### 3. Payout Schedule

- **Frequency**: Monthly (1st of each month)
- **Processing**: Automatic for amounts > $50
- **Manual**: Available for smaller amounts on request

### 4. Revenue Tracking

- **Subscription Revenue**: Track all subscription payments
- **Platform Fees**: Deduct existing platform fees (10-15%)
- **Net Sales**: Calculate commission on net amount

## Security Considerations

### 1. Authentication

- Use existing Firebase authentication
- Require Stripe Connect account for payouts
- Validate affiliate status before processing

### 2. Data Protection

- Encrypt sensitive financial data
- Audit trail for all commission changes
- GDPR compliance for EU affiliates

### 3. Fraud Prevention

- Monitor for suspicious referral patterns
- Implement rate limiting on API endpoints
- Validate referral codes server-side

## Monitoring & Analytics

### 1. Key Metrics

- Conversion rates by affiliate
- Average commission per affiliate
- Payout success rates
- Revenue attribution

### 2. Reporting

- Monthly affiliate statements
- Real-time dashboard updates
- Export capabilities for accounting

### 3. Alerts

- Failed payout notifications
- Suspicious activity alerts
- Low balance warnings

## Deployment Strategy

### 1. Phase 1: Core Infrastructure

- Database schema setup
- Basic API endpoints
- Referral code generation

### 2. Phase 2: Stripe Integration

- Webhook handling
- Commission calculation
- Payout processing

### 3. Phase 3: Frontend Integration

- Affiliate dashboard
- Referral code input
- Commission tracking

### 4. Phase 4: Advanced Features

- Analytics dashboard
- Automated reporting
- Advanced fraud detection

## Environment Variables

```bash
# Main Firebase Project (existing - for authentication)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Affiliate Firebase Project (new - separate project)
NEXT_PUBLIC_AFFILIATE_FIREBASE_API_KEY=your-affiliate-api-key
NEXT_PUBLIC_AFFILIATE_FIREBASE_AUTH_DOMAIN=inflamed-affiliates.firebaseapp.com
NEXT_PUBLIC_AFFILIATE_FIREBASE_PROJECT_ID=inflamed-affiliates
NEXT_PUBLIC_AFFILIATE_FIREBASE_STORAGE_BUCKET=inflamed-affiliates.appspot.com
NEXT_PUBLIC_AFFILIATE_FIREBASE_MESSAGING_SENDER_ID=your-affiliate-sender-id
NEXT_PUBLIC_AFFILIATE_FIREBASE_APP_ID=your-affiliate-app-id

# Stripe (existing)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# API (existing)
NEXT_PUBLIC_API_ENDPOINT=https://api.inflamed.com

# Email (if needed for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@inflamed.com
SMTP_PASS=your-app-password
```

## Testing Strategy

### 1. Unit Tests

- Commission calculation logic
- Referral code validation
- Payout processing

### 2. Integration Tests

- Stripe webhook handling
- Database operations
- API endpoint testing

### 3. End-to-End Tests

- Complete referral flow
- Payout processing
- Dashboard functionality

## Conclusion

This referral tracking system leverages the existing InflaMed infrastructure while adding comprehensive affiliate management capabilities. The system is designed to be scalable, secure, and maintainable, with clear integration points to the existing codebase.

The modular architecture allows for phased implementation, ensuring minimal disruption to the existing platform while providing powerful new affiliate management features.
