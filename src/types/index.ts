import { Timestamp } from "firebase/firestore";

// ============================================
// COMMON TYPES
// ============================================

export type Timestamped = {
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type SoftDeletable = {
  deletedAt?: Timestamp;
  isDeleted?: boolean;
};

// ============================================
// USERS & AUTH
// ============================================

export type UserRole =
  | "participant"
  | "organizer"
  | "judge"
  | "mentor"
  | "sponsor_rep"
  | "moderator"
  | "admin"
  | "super_admin";

export type ExperienceLevel = "beginner" | "intermediate" | "advanced" | "expert";

export type User = Timestamped & {
  uid: string;
  email: string;
  displayName: string;
  username: string;
  photoURL?: string;
  emailVerified: boolean;
  roles: UserRole[];
  country?: string;
  timezone?: string;
  college?: string;
  organization?: string;
  bio?: string;
  skills: string[];
  interests: string[];
  languages: string[];
  experienceLevel?: ExperienceLevel;
  githubUrl?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  twitterUrl?: string;
  portfolioLinks: string[];
  onboardingComplete: boolean;
  planId?: string;
  isActive: boolean;
  lookingForTeam: boolean;
  followersCount: number;
  followingCount: number;
  hackathonsJoined: number;
  projectsPublished: number;
  lastActiveAt?: Timestamp;
};

export type UserProfile = {
  uid: string;
  username: string;
  displayName: string;
  photoURL?: string;
  coverURL?: string;
  bio?: string;
  country?: string;
  college?: string;
  skills: string[];
  technologies: string[];
  interests: string[];
  socialLinks: SocialLink[];
  featuredProjects: string[];
  hackathonsJoined: number;
  projectsPublished: number;
  achievements: string[];
  visibility: ProfileVisibility;
  isPublic: boolean;
  lookingForTeam: boolean;
  updatedAt: Timestamp;
};

export type ProfileVisibility = {
  email: "public" | "private";
  country: "public" | "private";
  college: "public" | "private";
  skills: "public" | "private";
};

export type SocialLink = {
  platform: "github" | "linkedin" | "twitter" | "website" | "youtube" | "discord";
  url: string;
};

// ============================================
// ORGANIZATIONS
// ============================================

export type OrgType =
  | "college"
  | "university"
  | "company"
  | "startup"
  | "community"
  | "nonprofit"
  | "individual";

export type VerificationStatus =
  | "unverified"
  | "pending"
  | "more_info_required"
  | "verified"
  | "rejected"
  | "suspended";

export type Organization = Timestamped & {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  coverImage?: string;
  description?: string;
  website?: string;
  contactEmail: string;
  country: string;
  type: OrgType;
  socialLinks: SocialLink[];
  ownerId: string;
  memberIds: string[];
  verificationStatus: VerificationStatus;
  verifiedAt?: Timestamp;
  planId?: string;
  isActive: boolean;
  hackathonsHosted: number;
};

export type OrgMemberRole = "owner" | "admin" | "manager" | "viewer";

export type OrgMember = Timestamped & {
  orgId: string;
  userId: string;
  role: OrgMemberRole;
  invitedBy: string;
  joinedAt: Timestamp;
};

// ============================================
// HACKATHONS
// ============================================

export type HackathonStatus =
  | "draft"
  | "payment_pending"
  | "pending_review"
  | "more_info_required"
  | "suspended"
  | "approved"
  | "published"
  | "registration_open"
  | "registration_closed"
  | "ongoing"
  | "judging"
  | "results_announced"
  | "completed"
  | "archived"
  | "cancelled"
  | "rejected";

export type HackathonMode = "online" | "offline" | "hybrid";

export type HackathonDifficulty = "beginner" | "intermediate" | "advanced" | "open";

export type HackathonVisibility = "public" | "unlisted" | "private" | "invite_only";

export type HackathonCategory =
  | "ai_ml"
  | "web3"
  | "fintech"
  | "healthtech"
  | "edtech"
  | "sustainability"
  | "social_impact"
  | "developer_tools"
  | "gaming"
  | "iot"
  | "cybersecurity"
  | "open_innovation"
  | "other";

export type Hackathon = Timestamped & {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  summary: string;
  description: string;
  category: HackathonCategory;
  themes: string[];
  technologies: string[];
  difficulty: HackathonDifficulty;
  mode: HackathonMode;
  status: HackathonStatus;
  visibility: HackathonVisibility;
  inviteCode?: string;

  // Organizer
  organizerId: string;
  organizerType: "user" | "organization";
  organizationId?: string;
  coOrganizerIds: string[];
  contactEmail: string;
  supportChannel?: string;

  // Media
  coverImage?: string;
  logoImage?: string;
  bannerImages: string[];

  // Location (for offline/hybrid)
  country?: string;
  city?: string;
  venueName?: string;
  venueAddress?: string;
  venueCoordinates?: { lat: number; lng: number };
  onlinePlatform?: string;

  // Dates (all stored as UTC Timestamps)
  publicationDate?: Timestamp;
  registrationOpenDate: Timestamp;
  registrationCloseDate: Timestamp;
  teamFormationDeadline?: Timestamp;
  startDate: Timestamp;
  endDate: Timestamp;
  submissionOpenDate: Timestamp;
  submissionCloseDate: Timestamp;
  judgingStartDate?: Timestamp;
  judgingEndDate?: Timestamp;
  resultsAnnouncementDate?: Timestamp;
  certificateReleaseDate?: Timestamp;
  eventTimezone: string;

  // Eligibility
  isPublic: boolean;
  allowsIndividuals: boolean;
  requiresTeam: boolean;
  minAge?: number;
  eligibleCountries?: string[];
  excludedCountries?: string[];
  studentsOnly: boolean;
  emailDomainRestrictions?: string[];
  requiresApproval: boolean;

  // Team config
  minTeamSize: number;
  maxTeamSize: number;
  allowSolo: boolean;
  teamRegistrationDeadline?: Timestamp;
  publicTeamDiscovery: boolean;

  // Registration
  registrationCapacity?: number;
  hasWaitlist: boolean;
  registrationMode: "open" | "application" | "invite_only";

  // Pricing
  isFree: boolean;
  currency: string;

  // Submission
  allowMultipleTracks: boolean;
  allowMultipleProjects: boolean;

  // Judging
  hasPublicVoting: boolean;
  isBlindJudging: boolean;

  // Stats
  registrationCount: number;
  teamCount: number;
  submissionCount: number;
  viewCount: number;

  // SEO
  seoTitle?: string;
  seoDescription?: string;

  // Feature flags
  isFeatured: boolean;
  isStaffPick: boolean;
  featuredUntil?: Timestamp;

  // Admin
  approvedBy?: string;
  approvedAt?: Timestamp;
  rejectionReason?: string;

  // Completion percentage (for wizard)
  completionPercentage: number;
  completedSteps: number[];

  // ── Embedded sub-data (see DECISIONS.md D6) ──
  organizerName?: string;
  organizerPhotoURL?: string;
  rules?: string;
  faq?: HackathonFaqItem[];
  tracks?: EmbeddedTrack[];
  prizes?: EmbeddedPrize[];
  sponsors?: EmbeddedSponsor[];
  schedule?: EmbeddedScheduleItem[];
  judgingCriteria?: JudgingCriterion[];
  judgeInvites?: JudgeInvite[];
  registrationQuestions?: RegistrationQuestion[];
  stages?: HackathonStage[];
  resources?: HackathonResourceLink[];

  // Derived / server-maintained
  totalPrizeInPaise?: number;
  lowestTicketPriceInPaise?: number;
  searchKeywords?: string[];
  isListed?: boolean; // ★ server only: approved + public
  isSeed?: boolean;
  listingFee?: {
    amountInPaise: number;
    orderId?: string;
    paymentId?: string;
    paid: boolean;
    paidAt?: Timestamp;
    provider?: "razorpay" | "dev";
  };
  review?: {
    submittedAt?: Timestamp;
    reviewedAt?: Timestamp;
    reviewedBy?: string;
    decision?: "approved" | "rejected" | "more_info_required" | "suspended";
    message?: string;
    history?: { at: Timestamp; by: string; decision: string; message?: string }[];
  };
};

export type HackathonFaqItem = { id: string; question: string; answer: string };

export type EmbeddedTrack = {
  id: string;
  name: string;
  description: string;
  sponsorName?: string;
};

export type EmbeddedPrize = {
  id: string;
  name: string;
  rank?: number;
  type: "cash" | "non_cash";
  cashAmount?: number; // major units (₹)
  currency: string;
  description?: string;
  sponsorName?: string;
  trackId?: string;
  winnersCount: number;
};

export type EmbeddedSponsor = {
  id: string;
  name: string;
  tier: "title" | "platinum" | "gold" | "silver" | "community" | "partner";
  logoUrl?: string;
  website?: string;
};

export type EmbeddedScheduleItem = {
  id: string;
  title: string;
  type: HackathonScheduleItem["type"];
  startTime: Timestamp;
  endTime?: Timestamp;
  location?: string;
  meetingLink?: string;
  description?: string;
};

export type JudgeInvite = {
  email: string;
  name?: string;
  status: "invited" | "accepted" | "declined";
  uid?: string;
};

export type RegistrationQuestion = {
  id: string;
  label: string;
  type: "text" | "textarea" | "select" | "file" | "url";
  options?: string[];
  required: boolean;
};

export type HackathonStage = {
  id: string;
  name: string; // e.g. "Registration", "Idea submission", "Shortlisting", "Grand finale"
  description?: string;
  startDate: Timestamp;
  endDate: Timestamp;
  kind: "registration" | "submission" | "shortlisting" | "final" | "custom";
};

export type HackathonResourceLink = { id: string; title: string; url: string; kind?: string };

// ============================================
// PLATFORM
// ============================================

export type PlatformSettings = {
  listingFeeInPaise: number; // default 300 (₹3)
  listingFeeCurrency: "INR";
  categories: { id: HackathonCategory; label: string }[];
  featureFlags: Record<string, boolean>;
  supportEmail?: string;
  updatedAt?: Timestamp;
  updatedBy?: string;
};

export type PlatformStats = {
  users: number;
  liveHackathons: number;
  totalHackathons: number;
  totalRegistrations: number;
  totalProjects: number;
  totalPrizePoolInPaise: number;
  listingFeeRevenueInPaise: number;
  updatedAt?: Timestamp;
};

export type Invoice = Timestamped & {
  id: string;
  invoiceNumber: string;
  orderId: string;
  paymentId: string;
  userId: string;
  hackathonId: string;
  kind: "listing_fee" | "registration";
  amount: number; // paise
  currency: string;
  lineItems: { description: string; amount: number }[];
  billedTo: { name: string; email: string };
};

export type WebhookEvent = {
  id: string; // Razorpay event id
  event: string;
  receivedAt: Timestamp;
  processedAt?: Timestamp;
  status: "processed" | "ignored" | "failed";
  error?: string;
};

export type Announcement = Timestamped & {
  id: string;
  hackathonId: string;
  authorId: string;
  title: string;
  body: string;
  pinned: boolean;
  emailed: boolean;
};

export type DiscussionThread = Timestamped & {
  id: string;
  hackathonId: string;
  authorId: string;
  authorName: string;
  title: string;
  body: string;
  replyCount: number;
  isAnswered: boolean;
};

export type DiscussionReply = Timestamped & {
  id: string;
  threadId: string;
  authorId: string;
  authorName: string;
  body: string;
  isOrganizer: boolean;
};

export type TeamMessage = {
  id: string;
  teamId: string;
  senderId: string;
  senderName: string;
  senderPhotoURL?: string;
  body: string;
  createdAt: Timestamp;
};

export type Bookmark = {
  id: string;
  userId: string;
  hackathonId: string;
  createdAt: Timestamp;
};

export type Follow = {
  id: string;
  followerId: string;
  targetId: string;
  targetType: "user" | "organizer";
  createdAt: Timestamp;
};

export type HackathonTrack = Timestamped & {
  id: string;
  hackathonId: string;
  name: string;
  description: string;
  sponsorId?: string;
  requirements?: string;
  resources?: string;
  judgeIds: string[];
  order: number;
  isActive: boolean;
};

export type HackathonPrize = Timestamped & {
  id: string;
  hackathonId: string;
  trackId?: string;
  name: string;
  rank?: number;
  category: "overall" | "track" | "sponsor" | "community" | "honorable_mention" | "custom";
  cashAmount?: number;
  currency?: string;
  description: string;
  sponsorId?: string;
  winnersCount: number;
  claimInstructions?: string;
  isOrganiserManaged: boolean;
  order: number;
};

export type HackathonScheduleItem = Timestamped & {
  id: string;
  hackathonId: string;
  title: string;
  description?: string;
  type: "ceremony" | "workshop" | "mentoring" | "break" | "judging" | "demo" | "award" | "other";
  startTime: Timestamp;
  endTime: Timestamp;
  location?: string;
  meetingLink?: string;
  hostIds: string[];
  capacity?: number;
  isPublic: boolean;
  requiresRegistration: boolean;
  tags: string[];
};

// ============================================
// REGISTRATION
// ============================================

export type RegistrationStatus =
  | "draft"
  | "pending_approval"
  | "awaiting_payment"
  | "payment_processing"
  | "confirmed"
  | "waitlisted"
  | "rejected"
  | "cancelled"
  | "refund_pending"
  | "refunded"
  | "checked_in"
  | "completed";

export type Registration = Timestamped & {
  id: string;
  hackathonId: string;
  userId: string;
  teamId?: string;
  status: RegistrationStatus;
  registrationType: "individual" | "team_captain" | "team_member";
  ticketId?: string;
  orderId?: string;
  approvedBy?: string;
  approvedAt?: Timestamp;
  rejectionReason?: string;
  checkedInAt?: Timestamp;
  checkedInBy?: string;
  cancellationReason?: string;
  cancelledAt?: Timestamp;
  statusHistory: RegistrationStatusHistory[];
};

export type RegistrationStatusHistory = {
  status: RegistrationStatus;
  timestamp: Timestamp;
  note?: string;
  actorId?: string;
};

// ============================================
// TEAMS
// ============================================

export type TeamStatus = "forming" | "complete" | "locked" | "dissolved";

export type Team = Timestamped & {
  id: string;
  hackathonId: string;
  name: string;
  slug: string;
  avatar?: string;
  description?: string;
  captainId: string;
  memberIds: string[];
  skills: string[];
  status: TeamStatus;
  isPublic: boolean;
  isLookingForMembers: boolean;
  maxSize: number;
  projectId?: string;
  submissionId?: string;
  inviteCode: string;
};

// ============================================
// PROJECTS & SUBMISSIONS
// ============================================

export type ProjectStatus = "draft" | "published" | "archived";

export type Project = Timestamped & SoftDeletable & {
  id: string;
  title: string;
  slug: string;
  tagline?: string;
  description: string;
  problemStatement?: string;
  inspiration?: string;
  howItWorks?: string;
  challenges?: string;
  achievements?: string;
  lessonsLearned?: string;
  futurePlans?: string;
  coverImage?: string;
  galleryImages: string[];
  demoVideoUrl?: string;
  liveUrl?: string;
  repositoryUrl?: string;
  documentationUrl?: string;
  technologies: string[];
  category?: string;
  license?: string;
  ownerId: string;
  teamId?: string;
  memberIds: string[];
  status: ProjectStatus;
  isPublic: boolean;
  likesCount: number;
  viewsCount: number;
  bookmarksCount: number;
  linkedHackathons: string[];
};

export type SubmissionStatus =
  | "draft"
  | "incomplete"
  | "submitted"
  | "under_review"
  | "revision_requested"
  | "eligible"
  | "ineligible"
  | "withdrawn"
  | "assigned"
  | "judged"
  | "finalist"
  | "winner"
  | "archived";

export type Submission = Timestamped & {
  id: string;
  hackathonId: string;
  projectId: string;
  teamId?: string;
  submittedBy: string;
  status: SubmissionStatus;
  trackIds: string[];
  submittedAt?: Timestamp;
  snapshotId?: string;
  eligibilityNote?: string;
  reviewedBy?: string;
  reviewedAt?: Timestamp;
  judgesAssigned: string[];
  finalScore?: number;
  rank?: number;
};

// ============================================
// JUDGING
// ============================================

export type JudgingCriterion = {
  id: string;
  name: string;
  description: string;
  weight: number; // 0-100, must total 100
  maxScore: number;
  scoreLabels?: Record<number, string>;
};

export type Evaluation = Timestamped & {
  id: string;
  hackathonId: string;
  submissionId: string;
  judgeId: string;
  scores: CriterionScore[];
  totalScore: number;
  comments?: string;
  isDraft: boolean;
  submittedAt?: Timestamp;
  hasConflict?: boolean;
};

export type CriterionScore = {
  criterionId: string;
  score: number;
  comment?: string;
};

// ============================================
// COMMERCE
// ============================================

export type TicketTierType =
  | "free"
  | "early_bird"
  | "standard"
  | "student"
  | "team"
  | "premium"
  | "vip"
  | "sponsor"
  | "workshop"
  | "custom";

export type TicketTier = Timestamped & {
  id: string;
  hackathonId: string;
  name: string;
  description?: string;
  type: TicketTierType;
  price: number; // In minor currency units (paise for INR, cents for USD)
  currency: string;
  capacity?: number;
  sold: number;
  reserved: number;
  saleStartDate?: Timestamp;
  saleEndDate?: Timestamp;
  perPersonLimit: number;
  perTeamLimit?: number;
  eligibilityRules?: string;
  isActive: boolean;
  order: number;
};

export type OrderStatus =
  | "pending"
  | "processing"
  | "paid"
  | "failed"
  | "cancelled"
  | "refunded"
  | "partially_refunded"
  | "expired";

export type Order = Timestamped & {
  id: string;
  orderNumber: string;
  hackathonId: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  currency: string;
  status: OrderStatus;
  couponCode?: string;
  couponId?: string;
  paymentProvider?: "razorpay" | "stripe";
  paymentIntentId?: string;
  idempotencyKey: string;
  expiresAt?: Timestamp;
  paidAt?: Timestamp;
};

export type OrderItem = {
  ticketTierId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  description: string;
};

export type PaymentStatus =
  | "pending"
  | "processing"
  | "authorized"
  | "captured"
  | "failed"
  | "cancelled"
  | "refunded";

export type Payment = Timestamped & {
  id: string;
  orderId: string;
  userId: string;
  hackathonId: string;
  provider: "razorpay" | "stripe";
  providerPaymentId: string;
  providerOrderId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method?: string;
  failureCode?: string;
  failureMessage?: string;
  capturedAt?: Timestamp;
  receiptUrl?: string;
};

export type Ticket = Timestamped & {
  id: string;
  ticketNumber: string;
  orderId: string;
  hackathonId: string;
  userId: string;
  tierId: string;
  tierName: string;
  status: "active" | "used" | "cancelled" | "refunded";
  qrCode: string;
  qrSecret: string; // Server-side HMAC for verification
  checkedInAt?: Timestamp;
  checkedInBy?: string;
};

export type Coupon = Timestamped & {
  id: string;
  hackathonId: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  currency?: string;
  usageLimit?: number;
  usedCount: number;
  perUserLimit: number;
  minOrderAmount?: number;
  validFrom?: Timestamp;
  validUntil?: Timestamp;
  applicableTierIds?: string[];
  isActive: boolean;
  createdBy: string;
};

// ============================================
// CERTIFICATES
// ============================================

export type CertificateType =
  | "participation"
  | "finalist"
  | "winner"
  | "runner_up"
  | "judge"
  | "mentor"
  | "organizer"
  | "volunteer"
  | "speaker";

export type Certificate = Timestamped & {
  id: string;
  serialNumber: string;
  hackathonId: string;
  hackathonName: string;
  userId: string;
  recipientName: string;
  type: CertificateType;
  issuedAt: Timestamp;
  issuedBy: string;
  verificationUrl: string;
  templateId?: string;
  pdfUrl?: string;
  isRevoked: boolean;
  revokedAt?: Timestamp;
  revokedReason?: string;
};

// ============================================
// NOTIFICATIONS
// ============================================

export type NotificationType =
  | "registration_confirmed"
  | "payment_success"
  | "payment_failed"
  | "team_invitation"
  | "team_accepted"
  | "event_update"
  | "deadline_reminder"
  | "submission_confirmed"
  | "revision_requested"
  | "judge_invitation"
  | "results_published"
  | "certificate_ready"
  | "refund_processed"
  | "announcement"
  | "system";

export type Notification = Timestamped & {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  linkUrl?: string;
  imageUrl?: string;
  isRead: boolean;
  readAt?: Timestamp;
  hackathonId?: string;
  metadata?: Record<string, string | number | boolean>;
};

// ============================================
// ACHIEVEMENTS
// ============================================

export type AchievementId =
  | "first_hackathon"
  | "first_submission"
  | "team_builder"
  | "finalist"
  | "winner"
  | "five_events"
  | "ten_projects"
  | "mentor"
  | "community_contributor"
  | "perfect_submission"
  | "speed_hacker";

export type Achievement = {
  id: AchievementId;
  name: string;
  description: string;
  iconUrl: string;
  category: "participation" | "achievement" | "community" | "special";
  rarity: "common" | "uncommon" | "rare" | "legendary";
};

export type UserAchievement = Timestamped & {
  id: string;
  userId: string;
  achievementId: AchievementId;
  awardedAt: Timestamp;
  hackathonId?: string;
  metadata?: Record<string, string | number>;
};

// ============================================
// AUDIT & ADMIN
// ============================================

export type AuditLog = Timestamped & {
  id: string;
  actorId: string;
  actorEmail?: string;
  action: string;
  resource: string;
  resourceId?: string;
  changes?: Record<string, { before: unknown; after: unknown }>;
  ipAddress?: string;
  userAgent?: string;
  status: "success" | "failure";
  notes?: string;
};

// ============================================
// SUBSCRIPTIONS & PLANS
// ============================================

export type PlanId = "community" | "growth" | "professional" | "enterprise";

export type SubscriptionPlan = {
  id: PlanId;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  currency: string;
  features: PlanFeature[];
  maxHackathons?: number;
  maxParticipantsPerEvent?: number;
  ticketFeePercentage: number;
  hasCustomDomain: boolean;
  hasWhiteLabel: boolean;
  hasAdvancedAnalytics: boolean;
  hasAIFeatures: boolean;
  hasPrioritySupport: boolean;
  hasApiAccess: boolean;
};

export type PlanFeature = {
  name: string;
  included: boolean;
  limit?: number | "unlimited";
};

// ============================================
// SEARCH & FILTERS
// ============================================

export type HackathonFilter = {
  query?: string;
  mode?: HackathonMode[];
  category?: HackathonCategory[];
  isFree?: boolean;
  country?: string;
  status?: HackathonStatus[];
  difficulty?: HackathonDifficulty[];
  minPrize?: number;
  maxPrize?: number;
  currency?: string;
  isVerifiedOrganizer?: boolean;
  allowsSolo?: boolean;
  maxTeamSize?: number;
  technologies?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  isFeatured?: boolean;
};

export type HackathonSortOption =
  | "recommended"
  | "newest"
  | "starting_soon"
  | "ending_soon"
  | "most_participants"
  | "largest_prize"
  | "most_relevant";
