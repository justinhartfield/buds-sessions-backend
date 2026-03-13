-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'HOST', 'GUEST', 'APPLICANT', 'PARTNER_ADMIN', 'PARTNER_MARKETER', 'PARTNER_VIEWER');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'WAITLISTED');

-- CreateEnum
CREATE TYPE "HostTier" AS ENUM ('BUDS_HOST', 'BUDS_PRO', 'FOUNDING_HOST');

-- CreateEnum
CREATE TYPE "HostStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'DEACTIVATED');

-- CreateEnum
CREATE TYPE "WelcomePackStatus" AS ENUM ('PENDING_APPROVAL', 'ORDERED', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED', 'RETURNED', 'REPLACEMENT_SENT');

-- CreateEnum
CREATE TYPE "WelcomePackVariant" AS ENUM ('STANDARD', 'FOUNDING_HOST_LIMITED_EDITION');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'RSVP_CLOSED', 'LIVE', 'COMPLETED', 'CANCELLED', 'FLAGGED', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SessionPhase" AS ENUM ('NOT_STARTED', 'WARM_UP', 'MAIN_EVENT', 'WIND_DOWN', 'ENDED');

-- CreateEnum
CREATE TYPE "GatheringFormat" AS ENUM ('STRAIN_TASTING', 'COOK_TOGETHER', 'VINYL_NIGHT', 'CONVERSATION_SALON', 'CREATIVE_WORKSHOP', 'WELLNESS_CIRCLE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "RSVPStatus" AS ENUM ('INVITED', 'ACCEPTED', 'DECLINED', 'WAITLISTED', 'CANCELLED', 'NO_SHOW', 'CHECKED_IN');

-- CreateEnum
CREATE TYPE "PointTransactionType" AS ENUM ('HOST_SESSION', 'ATTEND_SESSION', 'FIRST_SESSION_BONUS', 'REFER_HOST', 'SUBMIT_RECAP', 'FIVE_SESSION_MILESTONE', 'MANUAL_ADJUSTMENT', 'REDEMPTION', 'PRO_TIER_MULTIPLIER', 'EXPIRED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('APPLICATION_RECEIVED', 'APPLICATION_APPROVED', 'APPLICATION_REJECTED', 'APPLICATION_WAITLISTED', 'WELCOME_PACK_SHIPPED', 'WELCOME_PACK_DELIVERED', 'SESSION_INVITATION', 'SESSION_REMINDER_24H', 'SESSION_REMINDER_2H', 'SESSION_RSVP_UPDATE', 'SESSION_CANCELLED', 'SESSION_STARTING', 'SESSION_PHASE_CHANGE', 'SESSION_COMPLETED', 'RECAP_REMINDER', 'RECAP_SUBMITTED', 'POINTS_EARNED', 'TIER_UPGRADED', 'GUEST_FEEDBACK_RECEIVED', 'HOST_FLAGGED', 'CONNECTION_INTRO', 'REFERRAL_COMPLETED', 'MILESTONE_REACHED', 'SPONSORSHIP_REQUEST', 'SPONSOR_PRODUCT_SHIPPED', 'PARTNER_LEAD_GENERATED');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL', 'PUSH', 'IN_APP', 'SMS');

-- CreateEnum
CREATE TYPE "IncidentSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "FeedbackRating" AS ENUM ('ONE', 'TWO', 'THREE', 'FOUR', 'FIVE');

-- CreateEnum
CREATE TYPE "ConsentType" AS ENUM ('TERMS_OF_SERVICE', 'PRIVACY_POLICY', 'MARKETING_EMAIL', 'DATA_PROCESSING', 'AGE_VERIFICATION', 'PHOTO_CONSENT');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "BusinessCategory" AS ENUM ('PHARMACY', 'MANUFACTURER', 'DOCTOR', 'CBD_STORE', 'RESTAURANT_CAFE', 'SMOKE_SHOP', 'CANNABIS_SOCIAL_CLUB', 'WELLNESS_SPA', 'MUSIC_VENUE', 'FOOD_BEVERAGE', 'LIFESTYLE_ACCESSORIES', 'OTHER');

-- CreateEnum
CREATE TYPE "ComplianceTier" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "PartnerTier" AS ENUM ('COMMUNITY', 'GOLD', 'PLATINUM', 'TITLE_SPONSOR');

-- CreateEnum
CREATE TYPE "PartnerStatus" AS ENUM ('PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'CHURNED', 'DEACTIVATED');

-- CreateEnum
CREATE TYPE "PartnerVerificationStatus" AS ENUM ('PENDING', 'IN_REVIEW', 'VERIFIED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "SponsorshipType" AS ENUM ('SESSION_BASIC', 'SESSION_ENHANCED', 'SESSION_PREMIUM', 'FORMAT_CITY', 'FORMAT_NATIONAL', 'FORMAT_EXCLUSIVE_NATIONAL', 'WELCOME_PACK_INCLUSION', 'CONVERSATION_CARD', 'REWARDS_CATALOG_ITEM', 'HOST_KIT_ADD_ON', 'CO_HOSTED_EVENT', 'FEATURED_PLACEMENT');

-- CreateEnum
CREATE TYPE "SponsorshipStatus" AS ENUM ('SS_DRAFT', 'PENDING_REVIEW', 'PENDING_HOST_APPROVAL', 'SS_APPROVED', 'HOST_DECLINED', 'SS_ACTIVE', 'SS_COMPLETED', 'SS_CANCELLED', 'SS_EXPIRED');

-- CreateEnum
CREATE TYPE "WelcomePackInclusionStatus" AS ENUM ('SUBMITTED', 'WPI_IN_REVIEW', 'WPI_APPROVED', 'WPI_REJECTED', 'IN_ROTATION', 'ROTATED_OUT', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "ConversationCardSponsorStatus" AS ENUM ('CCS_SUBMITTED', 'CCS_IN_REVIEW', 'CCS_APPROVED', 'CCS_ACTIVE', 'UNDERPERFORMING', 'RETIRED', 'CCS_REJECTED');

-- CreateEnum
CREATE TYPE "HostKitAddOnStatus" AS ENUM ('HKAO_DRAFT', 'HKAO_IN_REVIEW', 'HKAO_ACTIVE', 'PAUSED', 'DISCONTINUED');

-- CreateEnum
CREATE TYPE "HostKitRequestStatus" AS ENUM ('REQUESTED', 'CONFIRMED', 'HKR_SHIPPED', 'RECEIVED', 'HKR_CANCELLED');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('GENERATED', 'DELIVERED', 'ACKNOWLEDGED', 'CONVERTED', 'LEAD_EXPIRED');

-- CreateEnum
CREATE TYPE "PartnerInvoiceStatus" AS ENUM ('PI_DRAFT', 'ISSUED', 'PAID', 'OVERDUE', 'VOID', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PartnerTeamRole" AS ENUM ('PARTNER_ADMIN', 'PARTNER_MARKETER', 'PARTNER_VIEWER');

-- CreateEnum
CREATE TYPE "FeaturedPlacementLocation" AS ENUM ('HOMEPAGE_PARTNER_BAR', 'PLAYBOOK_SIDEBAR', 'SESSION_RECOMMENDATIONS', 'PARTNER_DIRECTORY_FEATURED', 'EMAIL_NEWSLETTER');

-- CreateEnum
CREATE TYPE "CampaignType" AS ENUM ('SESSION_SPONSORSHIP', 'FORMAT_SPONSORSHIP', 'WELCOME_PACK', 'CONVERSATION_CARDS', 'REWARDS_CATALOG', 'HOST_KIT', 'FEATURED_PLACEMENT', 'CO_HOSTED_EVENT');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "auth_provider_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "display_name" TEXT,
    "avatar_url" TEXT,
    "phone" TEXT,
    "phone_verified" BOOLEAN NOT NULL DEFAULT false,
    "date_of_birth" DATE NOT NULL,
    "city" TEXT NOT NULL,
    "country_code" CHAR(2) NOT NULL DEFAULT 'DE',
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "weed_de_username" TEXT,
    "weed_de_user_id" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'GUEST',
    "locale" TEXT NOT NULL DEFAULT 'de-DE',
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Berlin',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "host_applications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "motivation" TEXT NOT NULL,
    "gathering_vision" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "weed_de_username" TEXT,
    "preferred_formats" "GatheringFormat"[],
    "hosting_experience" TEXT,
    "referral_code" TEXT,
    "referred_by_host_id" TEXT,
    "reviewer_id" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "review_notes" TEXT,
    "rejection_reason" TEXT,
    "founding_host_eligible" BOOLEAN NOT NULL DEFAULT false,
    "application_score" DECIMAL(5,2),
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "host_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hosts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "tier" "HostTier" NOT NULL DEFAULT 'BUDS_HOST',
    "status" "HostStatus" NOT NULL DEFAULT 'ACTIVE',
    "host_number" SERIAL NOT NULL,
    "referral_code" TEXT NOT NULL,
    "bio" TEXT,
    "specialties" "GatheringFormat"[],
    "total_sessions_hosted" INTEGER NOT NULL DEFAULT 0,
    "total_sessions_attended" INTEGER NOT NULL DEFAULT 0,
    "total_guests_hosted" INTEGER NOT NULL DEFAULT 0,
    "average_rating" DECIMAL(3,2),
    "total_ratings_count" INTEGER NOT NULL DEFAULT 0,
    "points_balance" INTEGER NOT NULL DEFAULT 0,
    "points_lifetime_earned" INTEGER NOT NULL DEFAULT 0,
    "points_lifetime_spent" INTEGER NOT NULL DEFAULT 0,
    "tier_promoted_at" TIMESTAMP(3),
    "first_session_at" TIMESTAMP(3),
    "last_session_at" TIMESTAMP(3),
    "weed_de_badge_synced" BOOLEAN NOT NULL DEFAULT false,
    "weed_de_badge_synced_at" TIMESTAMP(3),
    "suspension_reason" TEXT,
    "suspended_at" TIMESTAMP(3),
    "suspended_by_id" TEXT,
    "onboarding_completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "hosts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "welcome_packs" (
    "id" TEXT NOT NULL,
    "host_id" TEXT NOT NULL,
    "variant" "WelcomePackVariant" NOT NULL,
    "status" "WelcomePackStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
    "shipping_name" TEXT NOT NULL,
    "shipping_address_line1" TEXT NOT NULL,
    "shipping_address_line2" TEXT,
    "shipping_city" TEXT NOT NULL,
    "shipping_postal_code" TEXT NOT NULL,
    "shipping_country_code" CHAR(2) NOT NULL,
    "shipping_phone" TEXT,
    "fulfillment_provider" TEXT,
    "fulfillment_order_id" TEXT,
    "tracking_number" TEXT,
    "tracking_url" TEXT,
    "carrier" TEXT,
    "estimated_delivery_date" DATE,
    "shipped_at" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "delivery_confirmed_by" TEXT,
    "delivery_photo_url" TEXT,
    "return_reason" TEXT,
    "returned_at" TIMESTAMP(3),
    "replacement_pack_id" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "welcome_packs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "welcome_pack_items" (
    "id" TEXT NOT NULL,
    "welcome_pack_id" TEXT NOT NULL,
    "item_name" TEXT NOT NULL,
    "item_sku" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "is_included" BOOLEAN NOT NULL DEFAULT true,
    "substitution_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_partner_product" BOOLEAN NOT NULL DEFAULT false,
    "partner_id" TEXT,
    "inclusion_id" TEXT,

    CONSTRAINT "welcome_pack_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "host_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "format" "GatheringFormat" NOT NULL,
    "custom_format_name" TEXT,
    "status" "SessionStatus" NOT NULL DEFAULT 'DRAFT',
    "current_phase" "SessionPhase" NOT NULL DEFAULT 'NOT_STARTED',
    "scheduled_date" DATE NOT NULL,
    "scheduled_start_time" TIME NOT NULL,
    "scheduled_end_time" TIME NOT NULL,
    "timezone" TEXT NOT NULL,
    "actual_start_time" TIMESTAMP(3),
    "actual_end_time" TIMESTAMP(3),
    "warm_up_started_at" TIMESTAMP(3),
    "warm_up_ended_at" TIMESTAMP(3),
    "main_event_started_at" TIMESTAMP(3),
    "main_event_ended_at" TIMESTAMP(3),
    "wind_down_started_at" TIMESTAMP(3),
    "wind_down_ended_at" TIMESTAMP(3),
    "venue_type" TEXT NOT NULL,
    "venue_name" TEXT,
    "venue_address" TEXT,
    "venue_city" TEXT NOT NULL,
    "venue_country_code" CHAR(2) NOT NULL,
    "venue_latitude" DECIMAL(10,7),
    "venue_longitude" DECIMAL(10,7),
    "min_guests" INTEGER NOT NULL DEFAULT 4,
    "max_guests" INTEGER NOT NULL DEFAULT 12,
    "ideal_guests" INTEGER,
    "check_in_code" TEXT,
    "check_in_qr_url" TEXT,
    "is_private" BOOLEAN NOT NULL DEFAULT true,
    "atmosphere_checklist" JSONB,
    "supply_checklist" JSONB,
    "conversation_card_deck_id" TEXT,
    "playlist_url" TEXT,
    "signature_element" TEXT,
    "host_private_notes" TEXT,
    "cancellation_reason" TEXT,
    "cancelled_at" TIMESTAMP(3),
    "flag_reason" TEXT,
    "flagged_at" TIMESTAMP(3),
    "flagged_by_id" TEXT,
    "verified_at" TIMESTAMP(3),
    "verified_by_id" TEXT,
    "points_distributed" BOOLEAN NOT NULL DEFAULT false,
    "points_distributed_at" TIMESTAMP(3),
    "session_score" DECIMAL(5,2),
    "total_feedback_count" INTEGER NOT NULL DEFAULT 0,
    "average_feedback_rating" DECIMAL(3,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "is_sponsored" BOOLEAN NOT NULL DEFAULT false,
    "primary_sponsor_id" TEXT,
    "sponsorship_id" TEXT,
    "sponsor_product_feedback_enabled" BOOLEAN NOT NULL DEFAULT false,
    "sponsor_lead_capture_enabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_guests" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "rsvp_status" "RSVPStatus" NOT NULL DEFAULT 'INVITED',
    "invited_at" TIMESTAMP(3) NOT NULL,
    "invited_by" TEXT NOT NULL,
    "invite_message" TEXT,
    "responded_at" TIMESTAMP(3),
    "decline_reason" TEXT,
    "checked_in_at" TIMESTAMP(3),
    "checked_in_method" TEXT,
    "checked_out_at" TIMESTAMP(3),
    "is_plus_one" BOOLEAN NOT NULL DEFAULT false,
    "plus_one_name" TEXT,
    "dietary_notes" TEXT,
    "is_first_time_guest" BOOLEAN NOT NULL DEFAULT false,
    "is_first_time_with_host" BOOLEAN NOT NULL DEFAULT false,
    "points_awarded" INTEGER,
    "points_awarded_at" TIMESTAMP(3),
    "feedback_submitted" BOOLEAN NOT NULL DEFAULT false,
    "no_show_reason" TEXT,
    "waitlist_position" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_guests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_recaps" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "host_id" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "highlights" TEXT[],
    "what_worked" TEXT,
    "what_to_improve" TEXT,
    "guest_count_actual" INTEGER NOT NULL,
    "energy_level" INTEGER,
    "conversation_depth" INTEGER,
    "overall_satisfaction" INTEGER,
    "best_conversation_topic" TEXT,
    "signature_moment" TEXT,
    "would_repeat_format" BOOLEAN,
    "strains_featured" TEXT[],
    "food_served" TEXT,
    "music_playlist_url" TEXT,
    "postcard_filled" BOOLEAN NOT NULL DEFAULT false,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "admin_reviewed" BOOLEAN NOT NULL DEFAULT false,
    "admin_reviewed_at" TIMESTAMP(3),
    "admin_reviewed_by_id" TEXT,
    "points_awarded" BOOLEAN NOT NULL DEFAULT false,
    "submitted_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "sponsor_mentioned" BOOLEAN NOT NULL DEFAULT false,
    "sponsor_product_used" BOOLEAN,
    "sponsor_product_reception" TEXT,

    CONSTRAINT "session_recaps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_recap_photos" (
    "id" TEXT NOT NULL,
    "recap_id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "photo_url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "caption" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_cover" BOOLEAN NOT NULL DEFAULT false,
    "photo_consent_obtained" BOOLEAN NOT NULL DEFAULT true,
    "exif_stripped" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_recap_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guest_feedback" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "session_guest_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "host_id" TEXT NOT NULL,
    "overall_rating" INTEGER NOT NULL,
    "atmosphere_rating" INTEGER,
    "host_rating" INTEGER,
    "conversation_quality" INTEGER,
    "would_attend_again" BOOLEAN,
    "would_recommend_host" BOOLEAN,
    "highlight_moment" TEXT,
    "improvement_suggestion" TEXT,
    "felt_welcome" BOOLEAN,
    "group_size_feeling" TEXT,
    "is_anonymous" BOOLEAN NOT NULL DEFAULT false,
    "nps_score" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "sponsor_acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "sponsor_product_rating" INTEGER,
    "sponsor_product_comment" TEXT,
    "interested_in_sponsor_product" BOOLEAN,
    "consent_share_with_sponsor" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "guest_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "point_transactions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "host_id" TEXT,
    "session_id" TEXT,
    "type" "PointTransactionType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "balance_after" INTEGER NOT NULL,
    "multiplier" DECIMAL(3,2) NOT NULL DEFAULT 1.0,
    "base_amount" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "reference_id" TEXT,
    "admin_id" TEXT,
    "admin_note" TEXT,
    "is_reversed" BOOLEAN NOT NULL DEFAULT false,
    "reversed_by_transaction_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "point_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "point_redemptions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "host_id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "points_spent" INTEGER NOT NULL,
    "reward_catalog_item_id" TEXT NOT NULL,
    "fulfillment_status" TEXT NOT NULL,
    "external_order_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "point_redemptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reward_catalog_items" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "points_cost" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "image_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "stock_quantity" INTEGER,
    "min_tier" "HostTier",
    "valid_from" TIMESTAMP(3),
    "valid_until" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_partner_contributed" BOOLEAN NOT NULL DEFAULT false,
    "partner_id" TEXT,

    CONSTRAINT "reward_catalog_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_card_decks" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "format" "GatheringFormat",
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversation_card_decks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_cards" (
    "id" TEXT NOT NULL,
    "deck_id" TEXT NOT NULL,
    "prompt_text" TEXT NOT NULL,
    "phase" "SessionPhase" NOT NULL,
    "category" TEXT,
    "difficulty" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "times_used" INTEGER NOT NULL DEFAULT 0,
    "average_engagement_score" DECIMAL(3,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_sponsored" BOOLEAN NOT NULL DEFAULT false,
    "sponsor_partner_id" TEXT,
    "sponsored_card_id" TEXT,
    "attribution_text" TEXT,

    CONSTRAINT "conversation_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_conversation_card_usage" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "card_id" TEXT NOT NULL,
    "used_at" TIMESTAMP(3) NOT NULL,
    "phase_used_in" "SessionPhase" NOT NULL,
    "host_engagement_rating" INTEGER,
    "skipped" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "session_conversation_card_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gathering_format_templates" (
    "id" TEXT NOT NULL,
    "format" "GatheringFormat" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "suggested_group_size_min" INTEGER NOT NULL,
    "suggested_group_size_max" INTEGER NOT NULL,
    "difficulty" TEXT NOT NULL,
    "duration_minutes_min" INTEGER NOT NULL,
    "duration_minutes_max" INTEGER NOT NULL,
    "warm_up_suggestions" JSONB,
    "main_event_suggestions" JSONB,
    "wind_down_suggestions" JSONB,
    "supply_checklist_template" JSONB,
    "atmosphere_tips" JSONB,
    "recommended_card_deck_id" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gathering_format_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "host_referrals" (
    "id" TEXT NOT NULL,
    "referring_host_id" TEXT NOT NULL,
    "referred_application_id" TEXT NOT NULL,
    "referred_user_id" TEXT NOT NULL,
    "referral_code_used" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "points_awarded" BOOLEAN NOT NULL DEFAULT false,
    "points_awarded_at" TIMESTAMP(3),
    "points_transaction_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "host_referrals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_incidents" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "reported_by_id" TEXT NOT NULL,
    "severity" "IncidentSeverity" NOT NULL,
    "description" TEXT NOT NULL,
    "resolution" TEXT,
    "resolved_at" TIMESTAMP(3),
    "resolved_by_id" TEXT,
    "admin_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "is_sent" BOOLEAN NOT NULL DEFAULT false,
    "sent_at" TIMESTAMP(3),
    "delivery_status" TEXT,
    "external_message_id" TEXT,
    "scheduled_for" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "notification_type" "NotificationType" NOT NULL,
    "email_enabled" BOOLEAN NOT NULL DEFAULT true,
    "push_enabled" BOOLEAN NOT NULL DEFAULT true,
    "sms_enabled" BOOLEAN NOT NULL DEFAULT false,
    "in_app_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_consents" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "consent_type" "ConsentType" NOT NULL,
    "granted" BOOLEAN NOT NULL,
    "granted_at" TIMESTAMP(3),
    "revoked_at" TIMESTAMP(3),
    "ip_address" TEXT,
    "user_agent" TEXT,
    "consent_version" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_consents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "connection_intros" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "host_id" TEXT NOT NULL,
    "user_a_id" TEXT NOT NULL,
    "user_b_id" TEXT NOT NULL,
    "intro_message" TEXT,
    "user_a_consented" BOOLEAN NOT NULL DEFAULT false,
    "user_b_consented" BOOLEAN NOT NULL DEFAULT false,
    "intro_sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "connection_intros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_audit_log" (
    "id" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "previous_state" JSONB,
    "new_state" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_snapshots" (
    "id" TEXT NOT NULL,
    "snapshot_date" DATE NOT NULL,
    "metric_name" TEXT NOT NULL,
    "metric_value" DECIMAL(15,4) NOT NULL,
    "dimension" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "host_milestones" (
    "id" TEXT NOT NULL,
    "host_id" TEXT NOT NULL,
    "milestone_key" TEXT NOT NULL,
    "achieved_at" TIMESTAMP(3) NOT NULL,
    "points_transaction_id" TEXT,
    "notified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "host_milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_export_requests" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "download_url" TEXT,
    "expires_at" TIMESTAMP(3),
    "requested_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "data_export_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_deletion_requests" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "reason" TEXT,
    "confirmation_token" TEXT,
    "confirmed_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "data_categories_deleted" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "data_deletion_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_organizations" (
    "id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "legal_name" TEXT NOT NULL,
    "category" "BusinessCategory" NOT NULL,
    "compliance_tier" "ComplianceTier" NOT NULL,
    "tier" "PartnerTier" NOT NULL DEFAULT 'COMMUNITY',
    "status" "PartnerStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "website" TEXT,
    "description" TEXT,
    "logo_url" TEXT,
    "cover_image_url" TEXT,
    "primary_contact_email" TEXT NOT NULL,
    "primary_contact_name" TEXT NOT NULL,
    "primary_contact_phone" TEXT,
    "billing_email" TEXT NOT NULL,
    "street_address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "postal_code" TEXT NOT NULL,
    "country_code" CHAR(2) NOT NULL DEFAULT 'DE',
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "tax_id" TEXT NOT NULL,
    "handelsregister_number" TEXT,
    "verification_status" "PartnerVerificationStatus" NOT NULL DEFAULT 'PENDING',
    "verified_at" TIMESTAMP(3),
    "verified_by_id" TEXT,
    "verification_documents_urls" TEXT[],
    "verification_notes" TEXT,
    "stripe_customer_id" TEXT,
    "stripe_subscription_id" TEXT,
    "billing_cycle" TEXT NOT NULL DEFAULT 'monthly',
    "current_period_start" TIMESTAMP(3),
    "current_period_end" TIMESTAMP(3),
    "total_sessions_sponsored" INTEGER NOT NULL DEFAULT 0,
    "total_impressions" INTEGER NOT NULL DEFAULT 0,
    "total_spend" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "average_product_rating" DECIMAL(3,2),
    "partner_success_manager_id" TEXT,
    "onboarding_completed_at" TIMESTAMP(3),
    "churned_at" TIMESTAMP(3),
    "churn_reason" TEXT,
    "referred_by_partner_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "partner_organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_team_members" (
    "id" TEXT NOT NULL,
    "partner_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "PartnerTeamRole" NOT NULL,
    "is_primary_contact" BOOLEAN NOT NULL DEFAULT false,
    "invited_at" TIMESTAMP(3),
    "accepted_at" TIMESTAMP(3),
    "removed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partner_team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_subscriptions" (
    "id" TEXT NOT NULL,
    "partner_id" TEXT NOT NULL,
    "tier" "PartnerTier" NOT NULL,
    "billing_cycle" TEXT NOT NULL,
    "monthly_amount_cents" INTEGER NOT NULL,
    "stripe_subscription_id" TEXT,
    "stripe_price_id" TEXT,
    "status" TEXT NOT NULL,
    "trial_end" TIMESTAMP(3),
    "current_period_start" TIMESTAMP(3) NOT NULL,
    "current_period_end" TIMESTAMP(3) NOT NULL,
    "cancelled_at" TIMESTAMP(3),
    "cancellation_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partner_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sponsorships" (
    "id" TEXT NOT NULL,
    "partner_id" TEXT NOT NULL,
    "type" "SponsorshipType" NOT NULL,
    "status" "SponsorshipStatus" NOT NULL DEFAULT 'SS_DRAFT',
    "session_id" TEXT,
    "format" "GatheringFormat",
    "city" TEXT,
    "host_id" TEXT,
    "start_date" DATE,
    "end_date" DATE,
    "amount_cents" INTEGER NOT NULL,
    "host_approved" BOOLEAN,
    "host_approved_at" TIMESTAMP(3),
    "host_decline_reason" TEXT,
    "host_counter_proposal" TEXT,
    "editorial_approved" BOOLEAN,
    "editorial_approved_at" TIMESTAMP(3),
    "editorial_approved_by_id" TEXT,
    "editorial_notes" TEXT,
    "product_samples_required" BOOLEAN NOT NULL DEFAULT false,
    "product_samples_shipped" BOOLEAN NOT NULL DEFAULT false,
    "product_samples_received" BOOLEAN NOT NULL DEFAULT false,
    "leave_behind_approved" BOOLEAN,
    "leave_behind_description" TEXT,
    "branded_cards_count" INTEGER NOT NULL DEFAULT 0,
    "include_product_feedback" BOOLEAN NOT NULL DEFAULT false,
    "include_lead_capture" BOOLEAN NOT NULL DEFAULT false,
    "total_impressions" INTEGER NOT NULL DEFAULT 0,
    "total_product_ratings" INTEGER NOT NULL DEFAULT 0,
    "average_product_rating" DECIMAL(3,2),
    "total_leads_generated" INTEGER NOT NULL DEFAULT 0,
    "recap_mentions" INTEGER NOT NULL DEFAULT 0,
    "invoice_id" TEXT,
    "campaign_id" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "sponsorships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_campaigns" (
    "id" TEXT NOT NULL,
    "partner_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "CampaignType" NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "budget_cents" INTEGER,
    "spent_cents" INTEGER NOT NULL DEFAULT 0,
    "target_city" TEXT,
    "target_format" "GatheringFormat",
    "total_sponsorships" INTEGER NOT NULL DEFAULT 0,
    "total_impressions" INTEGER NOT NULL DEFAULT 0,
    "total_leads" INTEGER NOT NULL DEFAULT 0,
    "average_product_rating" DECIMAL(3,2),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partner_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "welcome_pack_inclusions" (
    "id" TEXT NOT NULL,
    "partner_id" TEXT NOT NULL,
    "sponsorship_id" TEXT,
    "product_name" TEXT NOT NULL,
    "product_description" TEXT NOT NULL,
    "product_image_url" TEXT,
    "product_dimensions" TEXT,
    "product_weight_grams" INTEGER,
    "quantity_available" INTEGER NOT NULL,
    "quantity_used" INTEGER NOT NULL DEFAULT 0,
    "status" "WelcomePackInclusionStatus" NOT NULL DEFAULT 'SUBMITTED',
    "target_quarter" TEXT NOT NULL,
    "rotation_priority" INTEGER NOT NULL DEFAULT 0,
    "review_notes" TEXT,
    "reviewed_by_id" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "in_rotation_from" DATE,
    "in_rotation_until" DATE,
    "fee_amount_cents" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "welcome_pack_inclusions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sponsored_conversation_cards" (
    "id" TEXT NOT NULL,
    "partner_id" TEXT NOT NULL,
    "sponsorship_id" TEXT,
    "card_id" TEXT,
    "prompt_text" TEXT NOT NULL,
    "attribution_text" TEXT NOT NULL,
    "target_phase" "SessionPhase" NOT NULL,
    "target_format" "GatheringFormat",
    "status" "ConversationCardSponsorStatus" NOT NULL DEFAULT 'CCS_SUBMITTED',
    "times_used" INTEGER NOT NULL DEFAULT 0,
    "average_engagement" DECIMAL(3,2),
    "review_notes" TEXT,
    "reviewed_by_id" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "active_from" DATE,
    "active_until" DATE,
    "fee_amount_cents" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sponsored_conversation_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "host_kit_add_ons" (
    "id" TEXT NOT NULL,
    "partner_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "contents_description" TEXT NOT NULL,
    "image_url" TEXT,
    "target_formats" "GatheringFormat"[],
    "min_host_tier" "HostTier",
    "quantity_available" INTEGER NOT NULL,
    "quantity_fulfilled" INTEGER NOT NULL DEFAULT 0,
    "shipping_lead_days" INTEGER NOT NULL,
    "status" "HostKitAddOnStatus" NOT NULL DEFAULT 'HKAO_DRAFT',
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "listing_fee_cents" INTEGER NOT NULL DEFAULT 0,
    "average_rating" DECIMAL(3,2),
    "total_ratings" INTEGER NOT NULL DEFAULT 0,
    "review_notes" TEXT,
    "reviewed_by_id" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "host_kit_add_ons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "host_kit_requests" (
    "id" TEXT NOT NULL,
    "kit_id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "host_id" TEXT NOT NULL,
    "partner_id" TEXT NOT NULL,
    "status" "HostKitRequestStatus" NOT NULL DEFAULT 'REQUESTED',
    "shipping_address_shared" BOOLEAN NOT NULL DEFAULT false,
    "shipping_address_share_token" TEXT,
    "shipping_address_share_expires" TIMESTAMP(3),
    "tracking_number" TEXT,
    "shipped_at" TIMESTAMP(3),
    "received_at" TIMESTAMP(3),
    "host_rating" INTEGER,
    "host_feedback" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "host_kit_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_reward_catalog_items" (
    "id" TEXT NOT NULL,
    "reward_catalog_item_id" TEXT NOT NULL,
    "partner_id" TEXT NOT NULL,
    "retail_value_cents" INTEGER NOT NULL,
    "listing_fee_cents" INTEGER NOT NULL,
    "fulfillment_instructions" TEXT,
    "total_redemptions" INTEGER NOT NULL DEFAULT 0,
    "last_redeemed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partner_reward_catalog_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sponsor_product_feedback" (
    "id" TEXT NOT NULL,
    "sponsorship_id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "partner_id" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "would_purchase" BOOLEAN,
    "wants_more_info" BOOLEAN NOT NULL DEFAULT false,
    "is_anonymous" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sponsor_product_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_leads" (
    "id" TEXT NOT NULL,
    "partner_id" TEXT NOT NULL,
    "sponsorship_id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "LeadStatus" NOT NULL DEFAULT 'GENERATED',
    "user_consented_at" TIMESTAMP(3) NOT NULL,
    "user_email" TEXT,
    "user_city" TEXT,
    "product_interest" TEXT,
    "delivered_to_partner_at" TIMESTAMP(3),
    "partner_acknowledged_at" TIMESTAMP(3),
    "converted_at" TIMESTAMP(3),
    "conversion_value_cents" INTEGER,
    "lead_fee_cents" INTEGER NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partner_leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_invoices" (
    "id" TEXT NOT NULL,
    "partner_id" TEXT NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "status" "PartnerInvoiceStatus" NOT NULL DEFAULT 'PI_DRAFT',
    "subtotal_cents" INTEGER NOT NULL,
    "tax_cents" INTEGER NOT NULL,
    "total_cents" INTEGER NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'EUR',
    "billing_period_start" DATE,
    "billing_period_end" DATE,
    "due_date" DATE NOT NULL,
    "paid_at" TIMESTAMP(3),
    "stripe_invoice_id" TEXT,
    "stripe_payment_intent_id" TEXT,
    "pdf_url" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partner_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_invoice_line_items" (
    "id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "SponsorshipType" NOT NULL,
    "reference_id" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_price_cents" INTEGER NOT NULL,
    "total_cents" INTEGER NOT NULL,
    "tax_rate" DECIMAL(5,4) NOT NULL DEFAULT 0.19,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "partner_invoice_line_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "featured_placements" (
    "id" TEXT NOT NULL,
    "partner_id" TEXT NOT NULL,
    "location" "FeaturedPlacementLocation" NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "fee_cents" INTEGER NOT NULL,
    "impression_count" INTEGER NOT NULL DEFAULT 0,
    "click_count" INTEGER NOT NULL DEFAULT 0,
    "asset_url" TEXT,
    "destination_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "invoice_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "featured_placements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_analytics_snapshots" (
    "id" TEXT NOT NULL,
    "partner_id" TEXT NOT NULL,
    "snapshot_date" DATE NOT NULL,
    "metric_name" TEXT NOT NULL,
    "metric_value" DECIMAL(15,4) NOT NULL,
    "dimension" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "partner_analytics_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_exclusivity_locks" (
    "id" TEXT NOT NULL,
    "partner_id" TEXT NOT NULL,
    "exclusivity_type" TEXT NOT NULL,
    "format" "GatheringFormat",
    "category" "BusinessCategory",
    "city" TEXT,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "renewal_priority" BOOLEAN NOT NULL DEFAULT true,
    "fee_cents" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partner_exclusivity_locks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_audit_log" (
    "id" TEXT NOT NULL,
    "partner_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "previous_state" JSONB,
    "new_state" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "partner_audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_auth_provider_id_key" ON "users"("auth_provider_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_weed_de_username_key" ON "users"("weed_de_username");

-- CreateIndex
CREATE UNIQUE INDEX "users_weed_de_user_id_key" ON "users"("weed_de_user_id");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_city_idx" ON "users"("city");

-- CreateIndex
CREATE INDEX "users_country_code_idx" ON "users"("country_code");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "host_applications_user_id_idx" ON "host_applications"("user_id");

-- CreateIndex
CREATE INDEX "host_applications_status_idx" ON "host_applications"("status");

-- CreateIndex
CREATE INDEX "host_applications_created_at_idx" ON "host_applications"("created_at");

-- CreateIndex
CREATE INDEX "host_applications_referred_by_host_id_idx" ON "host_applications"("referred_by_host_id");

-- CreateIndex
CREATE UNIQUE INDEX "hosts_user_id_key" ON "hosts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "hosts_application_id_key" ON "hosts"("application_id");

-- CreateIndex
CREATE UNIQUE INDEX "hosts_host_number_key" ON "hosts"("host_number");

-- CreateIndex
CREATE UNIQUE INDEX "hosts_referral_code_key" ON "hosts"("referral_code");

-- CreateIndex
CREATE INDEX "hosts_tier_idx" ON "hosts"("tier");

-- CreateIndex
CREATE INDEX "hosts_status_idx" ON "hosts"("status");

-- CreateIndex
CREATE INDEX "hosts_referral_code_idx" ON "hosts"("referral_code");

-- CreateIndex
CREATE INDEX "hosts_average_rating_idx" ON "hosts"("average_rating");

-- CreateIndex
CREATE INDEX "hosts_total_sessions_hosted_idx" ON "hosts"("total_sessions_hosted");

-- CreateIndex
CREATE UNIQUE INDEX "welcome_packs_host_id_key" ON "welcome_packs"("host_id");

-- CreateIndex
CREATE UNIQUE INDEX "welcome_packs_replacement_pack_id_key" ON "welcome_packs"("replacement_pack_id");

-- CreateIndex
CREATE INDEX "welcome_packs_status_idx" ON "welcome_packs"("status");

-- CreateIndex
CREATE INDEX "welcome_packs_tracking_number_idx" ON "welcome_packs"("tracking_number");

-- CreateIndex
CREATE INDEX "welcome_packs_fulfillment_order_id_idx" ON "welcome_packs"("fulfillment_order_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_check_in_code_key" ON "sessions"("check_in_code");

-- CreateIndex
CREATE INDEX "sessions_host_id_idx" ON "sessions"("host_id");

-- CreateIndex
CREATE INDEX "sessions_status_idx" ON "sessions"("status");

-- CreateIndex
CREATE INDEX "sessions_scheduled_date_idx" ON "sessions"("scheduled_date");

-- CreateIndex
CREATE INDEX "sessions_format_idx" ON "sessions"("format");

-- CreateIndex
CREATE INDEX "sessions_venue_city_idx" ON "sessions"("venue_city");

-- CreateIndex
CREATE INDEX "sessions_current_phase_idx" ON "sessions"("current_phase");

-- CreateIndex
CREATE INDEX "sessions_check_in_code_idx" ON "sessions"("check_in_code");

-- CreateIndex
CREATE INDEX "session_guests_session_id_idx" ON "session_guests"("session_id");

-- CreateIndex
CREATE INDEX "session_guests_user_id_idx" ON "session_guests"("user_id");

-- CreateIndex
CREATE INDEX "session_guests_rsvp_status_idx" ON "session_guests"("rsvp_status");

-- CreateIndex
CREATE INDEX "session_guests_session_id_rsvp_status_idx" ON "session_guests"("session_id", "rsvp_status");

-- CreateIndex
CREATE UNIQUE INDEX "session_guests_session_id_user_id_key" ON "session_guests"("session_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "session_recaps_session_id_key" ON "session_recaps"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "guest_feedback_session_id_user_id_key" ON "guest_feedback"("session_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "point_transactions_reversed_by_transaction_id_key" ON "point_transactions"("reversed_by_transaction_id");

-- CreateIndex
CREATE INDEX "point_transactions_user_id_idx" ON "point_transactions"("user_id");

-- CreateIndex
CREATE INDEX "point_transactions_host_id_idx" ON "point_transactions"("host_id");

-- CreateIndex
CREATE INDEX "point_transactions_session_id_idx" ON "point_transactions"("session_id");

-- CreateIndex
CREATE INDEX "point_transactions_type_idx" ON "point_transactions"("type");

-- CreateIndex
CREATE INDEX "point_transactions_created_at_idx" ON "point_transactions"("created_at");

-- CreateIndex
CREATE INDEX "point_transactions_user_id_created_at_idx" ON "point_transactions"("user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "point_redemptions_transaction_id_key" ON "point_redemptions"("transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_cards_sponsored_card_id_key" ON "conversation_cards"("sponsored_card_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "notifications_type_idx" ON "notifications"("type");

-- CreateIndex
CREATE INDEX "notifications_is_read_idx" ON "notifications"("is_read");

-- CreateIndex
CREATE INDEX "notifications_scheduled_for_idx" ON "notifications"("scheduled_for");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_created_at_idx" ON "notifications"("user_id", "is_read", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_user_id_notification_type_key" ON "notification_preferences"("user_id", "notification_type");

-- CreateIndex
CREATE UNIQUE INDEX "user_consents_user_id_consent_type_consent_version_key" ON "user_consents"("user_id", "consent_type", "consent_version");

-- CreateIndex
CREATE INDEX "admin_audit_log_admin_id_idx" ON "admin_audit_log"("admin_id");

-- CreateIndex
CREATE INDEX "admin_audit_log_entity_type_entity_id_idx" ON "admin_audit_log"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "admin_audit_log_action_idx" ON "admin_audit_log"("action");

-- CreateIndex
CREATE INDEX "admin_audit_log_created_at_idx" ON "admin_audit_log"("created_at");

-- CreateIndex
CREATE INDEX "analytics_snapshots_snapshot_date_idx" ON "analytics_snapshots"("snapshot_date");

-- CreateIndex
CREATE INDEX "analytics_snapshots_metric_name_idx" ON "analytics_snapshots"("metric_name");

-- CreateIndex
CREATE UNIQUE INDEX "analytics_snapshots_snapshot_date_metric_name_dimension_key" ON "analytics_snapshots"("snapshot_date", "metric_name", "dimension");

-- CreateIndex
CREATE UNIQUE INDEX "host_milestones_host_id_milestone_key_key" ON "host_milestones"("host_id", "milestone_key");

-- CreateIndex
CREATE UNIQUE INDEX "partner_organizations_stripe_customer_id_key" ON "partner_organizations"("stripe_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "partner_organizations_stripe_subscription_id_key" ON "partner_organizations"("stripe_subscription_id");

-- CreateIndex
CREATE INDEX "partner_organizations_category_idx" ON "partner_organizations"("category");

-- CreateIndex
CREATE INDEX "partner_organizations_tier_idx" ON "partner_organizations"("tier");

-- CreateIndex
CREATE INDEX "partner_organizations_status_idx" ON "partner_organizations"("status");

-- CreateIndex
CREATE INDEX "partner_organizations_city_idx" ON "partner_organizations"("city");

-- CreateIndex
CREATE INDEX "partner_organizations_country_code_idx" ON "partner_organizations"("country_code");

-- CreateIndex
CREATE INDEX "partner_organizations_verification_status_idx" ON "partner_organizations"("verification_status");

-- CreateIndex
CREATE INDEX "partner_organizations_stripe_customer_id_idx" ON "partner_organizations"("stripe_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "partner_team_members_partner_id_user_id_key" ON "partner_team_members"("partner_id", "user_id");

-- CreateIndex
CREATE INDEX "partner_subscriptions_partner_id_idx" ON "partner_subscriptions"("partner_id");

-- CreateIndex
CREATE INDEX "partner_subscriptions_status_idx" ON "partner_subscriptions"("status");

-- CreateIndex
CREATE INDEX "partner_subscriptions_stripe_subscription_id_idx" ON "partner_subscriptions"("stripe_subscription_id");

-- CreateIndex
CREATE INDEX "sponsorships_partner_id_idx" ON "sponsorships"("partner_id");

-- CreateIndex
CREATE INDEX "sponsorships_type_idx" ON "sponsorships"("type");

-- CreateIndex
CREATE INDEX "sponsorships_status_idx" ON "sponsorships"("status");

-- CreateIndex
CREATE INDEX "sponsorships_session_id_idx" ON "sponsorships"("session_id");

-- CreateIndex
CREATE INDEX "sponsorships_format_idx" ON "sponsorships"("format");

-- CreateIndex
CREATE INDEX "sponsorships_city_idx" ON "sponsorships"("city");

-- CreateIndex
CREATE INDEX "sponsorships_host_id_idx" ON "sponsorships"("host_id");

-- CreateIndex
CREATE INDEX "sponsorships_start_date_idx" ON "sponsorships"("start_date");

-- CreateIndex
CREATE INDEX "sponsorships_end_date_idx" ON "sponsorships"("end_date");

-- CreateIndex
CREATE INDEX "sponsorships_campaign_id_idx" ON "sponsorships"("campaign_id");

-- CreateIndex
CREATE INDEX "partner_campaigns_partner_id_idx" ON "partner_campaigns"("partner_id");

-- CreateIndex
CREATE INDEX "partner_campaigns_type_idx" ON "partner_campaigns"("type");

-- CreateIndex
CREATE INDEX "partner_campaigns_is_active_idx" ON "partner_campaigns"("is_active");

-- CreateIndex
CREATE INDEX "partner_campaigns_start_date_idx" ON "partner_campaigns"("start_date");

-- CreateIndex
CREATE INDEX "partner_campaigns_target_city_idx" ON "partner_campaigns"("target_city");

-- CreateIndex
CREATE INDEX "welcome_pack_inclusions_partner_id_idx" ON "welcome_pack_inclusions"("partner_id");

-- CreateIndex
CREATE INDEX "welcome_pack_inclusions_status_idx" ON "welcome_pack_inclusions"("status");

-- CreateIndex
CREATE INDEX "welcome_pack_inclusions_target_quarter_idx" ON "welcome_pack_inclusions"("target_quarter");

-- CreateIndex
CREATE INDEX "sponsored_conversation_cards_partner_id_idx" ON "sponsored_conversation_cards"("partner_id");

-- CreateIndex
CREATE INDEX "sponsored_conversation_cards_status_idx" ON "sponsored_conversation_cards"("status");

-- CreateIndex
CREATE INDEX "sponsored_conversation_cards_card_id_idx" ON "sponsored_conversation_cards"("card_id");

-- CreateIndex
CREATE INDEX "sponsored_conversation_cards_target_format_idx" ON "sponsored_conversation_cards"("target_format");

-- CreateIndex
CREATE INDEX "host_kit_add_ons_partner_id_idx" ON "host_kit_add_ons"("partner_id");

-- CreateIndex
CREATE INDEX "host_kit_add_ons_status_idx" ON "host_kit_add_ons"("status");

-- CreateIndex
CREATE INDEX "host_kit_add_ons_is_featured_idx" ON "host_kit_add_ons"("is_featured");

-- CreateIndex
CREATE INDEX "host_kit_requests_kit_id_idx" ON "host_kit_requests"("kit_id");

-- CreateIndex
CREATE INDEX "host_kit_requests_session_id_idx" ON "host_kit_requests"("session_id");

-- CreateIndex
CREATE INDEX "host_kit_requests_host_id_idx" ON "host_kit_requests"("host_id");

-- CreateIndex
CREATE INDEX "host_kit_requests_partner_id_idx" ON "host_kit_requests"("partner_id");

-- CreateIndex
CREATE INDEX "host_kit_requests_status_idx" ON "host_kit_requests"("status");

-- CreateIndex
CREATE UNIQUE INDEX "host_kit_requests_kit_id_session_id_key" ON "host_kit_requests"("kit_id", "session_id");

-- CreateIndex
CREATE UNIQUE INDEX "partner_reward_catalog_items_reward_catalog_item_id_key" ON "partner_reward_catalog_items"("reward_catalog_item_id");

-- CreateIndex
CREATE INDEX "partner_reward_catalog_items_partner_id_idx" ON "partner_reward_catalog_items"("partner_id");

-- CreateIndex
CREATE INDEX "sponsor_product_feedback_sponsorship_id_idx" ON "sponsor_product_feedback"("sponsorship_id");

-- CreateIndex
CREATE INDEX "sponsor_product_feedback_session_id_idx" ON "sponsor_product_feedback"("session_id");

-- CreateIndex
CREATE INDEX "sponsor_product_feedback_partner_id_idx" ON "sponsor_product_feedback"("partner_id");

-- CreateIndex
CREATE INDEX "sponsor_product_feedback_rating_idx" ON "sponsor_product_feedback"("rating");

-- CreateIndex
CREATE UNIQUE INDEX "sponsor_product_feedback_sponsorship_id_user_id_key" ON "sponsor_product_feedback"("sponsorship_id", "user_id");

-- CreateIndex
CREATE INDEX "partner_leads_partner_id_idx" ON "partner_leads"("partner_id");

-- CreateIndex
CREATE INDEX "partner_leads_sponsorship_id_idx" ON "partner_leads"("sponsorship_id");

-- CreateIndex
CREATE INDEX "partner_leads_status_idx" ON "partner_leads"("status");

-- CreateIndex
CREATE INDEX "partner_leads_user_id_idx" ON "partner_leads"("user_id");

-- CreateIndex
CREATE INDEX "partner_leads_expires_at_idx" ON "partner_leads"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "partner_invoices_invoice_number_key" ON "partner_invoices"("invoice_number");

-- CreateIndex
CREATE INDEX "partner_invoices_partner_id_idx" ON "partner_invoices"("partner_id");

-- CreateIndex
CREATE INDEX "partner_invoices_status_idx" ON "partner_invoices"("status");

-- CreateIndex
CREATE INDEX "partner_invoices_invoice_number_idx" ON "partner_invoices"("invoice_number");

-- CreateIndex
CREATE INDEX "partner_invoices_due_date_idx" ON "partner_invoices"("due_date");

-- CreateIndex
CREATE INDEX "partner_invoices_stripe_invoice_id_idx" ON "partner_invoices"("stripe_invoice_id");

-- CreateIndex
CREATE INDEX "partner_invoice_line_items_invoice_id_idx" ON "partner_invoice_line_items"("invoice_id");

-- CreateIndex
CREATE INDEX "featured_placements_partner_id_idx" ON "featured_placements"("partner_id");

-- CreateIndex
CREATE INDEX "featured_placements_location_idx" ON "featured_placements"("location");

-- CreateIndex
CREATE INDEX "featured_placements_start_date_idx" ON "featured_placements"("start_date");

-- CreateIndex
CREATE INDEX "featured_placements_end_date_idx" ON "featured_placements"("end_date");

-- CreateIndex
CREATE INDEX "featured_placements_is_active_idx" ON "featured_placements"("is_active");

-- CreateIndex
CREATE INDEX "partner_analytics_snapshots_partner_id_idx" ON "partner_analytics_snapshots"("partner_id");

-- CreateIndex
CREATE INDEX "partner_analytics_snapshots_snapshot_date_idx" ON "partner_analytics_snapshots"("snapshot_date");

-- CreateIndex
CREATE INDEX "partner_analytics_snapshots_metric_name_idx" ON "partner_analytics_snapshots"("metric_name");

-- CreateIndex
CREATE UNIQUE INDEX "partner_analytics_snapshots_partner_id_snapshot_date_metric_key" ON "partner_analytics_snapshots"("partner_id", "snapshot_date", "metric_name", "dimension");

-- CreateIndex
CREATE INDEX "partner_exclusivity_locks_partner_id_idx" ON "partner_exclusivity_locks"("partner_id");

-- CreateIndex
CREATE INDEX "partner_exclusivity_locks_exclusivity_type_idx" ON "partner_exclusivity_locks"("exclusivity_type");

-- CreateIndex
CREATE INDEX "partner_exclusivity_locks_format_idx" ON "partner_exclusivity_locks"("format");

-- CreateIndex
CREATE INDEX "partner_exclusivity_locks_city_idx" ON "partner_exclusivity_locks"("city");

-- CreateIndex
CREATE INDEX "partner_exclusivity_locks_is_active_idx" ON "partner_exclusivity_locks"("is_active");

-- CreateIndex
CREATE INDEX "partner_exclusivity_locks_end_date_idx" ON "partner_exclusivity_locks"("end_date");

-- CreateIndex
CREATE UNIQUE INDEX "partner_exclusivity_locks_exclusivity_type_format_category__key" ON "partner_exclusivity_locks"("exclusivity_type", "format", "category", "city", "start_date");

-- CreateIndex
CREATE INDEX "partner_audit_log_partner_id_idx" ON "partner_audit_log"("partner_id");

-- CreateIndex
CREATE INDEX "partner_audit_log_action_idx" ON "partner_audit_log"("action");

-- CreateIndex
CREATE INDEX "partner_audit_log_entity_type_entity_id_idx" ON "partner_audit_log"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "partner_audit_log_created_at_idx" ON "partner_audit_log"("created_at");

-- AddForeignKey
ALTER TABLE "host_applications" ADD CONSTRAINT "host_applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "host_applications" ADD CONSTRAINT "host_applications_referred_by_host_id_fkey" FOREIGN KEY ("referred_by_host_id") REFERENCES "hosts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "host_applications" ADD CONSTRAINT "host_applications_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hosts" ADD CONSTRAINT "hosts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hosts" ADD CONSTRAINT "hosts_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "host_applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hosts" ADD CONSTRAINT "hosts_suspended_by_id_fkey" FOREIGN KEY ("suspended_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "welcome_packs" ADD CONSTRAINT "welcome_packs_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "hosts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "welcome_packs" ADD CONSTRAINT "welcome_packs_replacement_pack_id_fkey" FOREIGN KEY ("replacement_pack_id") REFERENCES "welcome_packs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "welcome_pack_items" ADD CONSTRAINT "welcome_pack_items_welcome_pack_id_fkey" FOREIGN KEY ("welcome_pack_id") REFERENCES "welcome_packs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "welcome_pack_items" ADD CONSTRAINT "welcome_pack_items_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partner_organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "welcome_pack_items" ADD CONSTRAINT "welcome_pack_items_inclusion_id_fkey" FOREIGN KEY ("inclusion_id") REFERENCES "welcome_pack_inclusions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "hosts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_conversation_card_deck_id_fkey" FOREIGN KEY ("conversation_card_deck_id") REFERENCES "conversation_card_decks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_flagged_by_id_fkey" FOREIGN KEY ("flagged_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_verified_by_id_fkey" FOREIGN KEY ("verified_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_primary_sponsor_id_fkey" FOREIGN KEY ("primary_sponsor_id") REFERENCES "partner_organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_sponsorship_id_fkey" FOREIGN KEY ("sponsorship_id") REFERENCES "sponsorships"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_guests" ADD CONSTRAINT "session_guests_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_guests" ADD CONSTRAINT "session_guests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_recaps" ADD CONSTRAINT "session_recaps_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_recaps" ADD CONSTRAINT "session_recaps_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "hosts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_recaps" ADD CONSTRAINT "session_recaps_admin_reviewed_by_id_fkey" FOREIGN KEY ("admin_reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_recap_photos" ADD CONSTRAINT "session_recap_photos_recap_id_fkey" FOREIGN KEY ("recap_id") REFERENCES "session_recaps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_recap_photos" ADD CONSTRAINT "session_recap_photos_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guest_feedback" ADD CONSTRAINT "guest_feedback_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guest_feedback" ADD CONSTRAINT "guest_feedback_session_guest_id_fkey" FOREIGN KEY ("session_guest_id") REFERENCES "session_guests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guest_feedback" ADD CONSTRAINT "guest_feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guest_feedback" ADD CONSTRAINT "guest_feedback_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "hosts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "point_transactions" ADD CONSTRAINT "point_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "point_transactions" ADD CONSTRAINT "point_transactions_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "hosts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "point_transactions" ADD CONSTRAINT "point_transactions_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "point_transactions" ADD CONSTRAINT "point_transactions_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "point_transactions" ADD CONSTRAINT "point_transactions_reversed_by_transaction_id_fkey" FOREIGN KEY ("reversed_by_transaction_id") REFERENCES "point_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "point_redemptions" ADD CONSTRAINT "point_redemptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "point_redemptions" ADD CONSTRAINT "point_redemptions_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "hosts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "point_redemptions" ADD CONSTRAINT "point_redemptions_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "point_transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "point_redemptions" ADD CONSTRAINT "point_redemptions_reward_catalog_item_id_fkey" FOREIGN KEY ("reward_catalog_item_id") REFERENCES "reward_catalog_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reward_catalog_items" ADD CONSTRAINT "reward_catalog_items_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partner_organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_card_decks" ADD CONSTRAINT "conversation_card_decks_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_cards" ADD CONSTRAINT "conversation_cards_deck_id_fkey" FOREIGN KEY ("deck_id") REFERENCES "conversation_card_decks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_cards" ADD CONSTRAINT "conversation_cards_sponsor_partner_id_fkey" FOREIGN KEY ("sponsor_partner_id") REFERENCES "partner_organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_cards" ADD CONSTRAINT "conversation_cards_sponsored_card_id_fkey" FOREIGN KEY ("sponsored_card_id") REFERENCES "sponsored_conversation_cards"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_conversation_card_usage" ADD CONSTRAINT "session_conversation_card_usage_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_conversation_card_usage" ADD CONSTRAINT "session_conversation_card_usage_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "conversation_cards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gathering_format_templates" ADD CONSTRAINT "gathering_format_templates_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gathering_format_templates" ADD CONSTRAINT "gathering_format_templates_recommended_card_deck_id_fkey" FOREIGN KEY ("recommended_card_deck_id") REFERENCES "conversation_card_decks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "host_referrals" ADD CONSTRAINT "host_referrals_referring_host_id_fkey" FOREIGN KEY ("referring_host_id") REFERENCES "hosts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "host_referrals" ADD CONSTRAINT "host_referrals_referred_application_id_fkey" FOREIGN KEY ("referred_application_id") REFERENCES "host_applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "host_referrals" ADD CONSTRAINT "host_referrals_referred_user_id_fkey" FOREIGN KEY ("referred_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "host_referrals" ADD CONSTRAINT "host_referrals_points_transaction_id_fkey" FOREIGN KEY ("points_transaction_id") REFERENCES "point_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_incidents" ADD CONSTRAINT "session_incidents_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_incidents" ADD CONSTRAINT "session_incidents_reported_by_id_fkey" FOREIGN KEY ("reported_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_incidents" ADD CONSTRAINT "session_incidents_resolved_by_id_fkey" FOREIGN KEY ("resolved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_consents" ADD CONSTRAINT "user_consents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connection_intros" ADD CONSTRAINT "connection_intros_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connection_intros" ADD CONSTRAINT "connection_intros_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "hosts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connection_intros" ADD CONSTRAINT "connection_intros_user_a_id_fkey" FOREIGN KEY ("user_a_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connection_intros" ADD CONSTRAINT "connection_intros_user_b_id_fkey" FOREIGN KEY ("user_b_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_audit_log" ADD CONSTRAINT "admin_audit_log_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "host_milestones" ADD CONSTRAINT "host_milestones_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "hosts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "host_milestones" ADD CONSTRAINT "host_milestones_points_transaction_id_fkey" FOREIGN KEY ("points_transaction_id") REFERENCES "point_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_export_requests" ADD CONSTRAINT "data_export_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_deletion_requests" ADD CONSTRAINT "data_deletion_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_organizations" ADD CONSTRAINT "partner_organizations_verified_by_id_fkey" FOREIGN KEY ("verified_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_organizations" ADD CONSTRAINT "partner_organizations_partner_success_manager_id_fkey" FOREIGN KEY ("partner_success_manager_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_organizations" ADD CONSTRAINT "partner_organizations_referred_by_partner_id_fkey" FOREIGN KEY ("referred_by_partner_id") REFERENCES "partner_organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_team_members" ADD CONSTRAINT "partner_team_members_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partner_organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_team_members" ADD CONSTRAINT "partner_team_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_subscriptions" ADD CONSTRAINT "partner_subscriptions_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partner_organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sponsorships" ADD CONSTRAINT "sponsorships_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partner_organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sponsorships" ADD CONSTRAINT "sponsorships_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sponsorships" ADD CONSTRAINT "sponsorships_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "hosts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sponsorships" ADD CONSTRAINT "sponsorships_editorial_approved_by_id_fkey" FOREIGN KEY ("editorial_approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sponsorships" ADD CONSTRAINT "sponsorships_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "partner_invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sponsorships" ADD CONSTRAINT "sponsorships_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "partner_campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_campaigns" ADD CONSTRAINT "partner_campaigns_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partner_organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "welcome_pack_inclusions" ADD CONSTRAINT "welcome_pack_inclusions_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partner_organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "welcome_pack_inclusions" ADD CONSTRAINT "welcome_pack_inclusions_sponsorship_id_fkey" FOREIGN KEY ("sponsorship_id") REFERENCES "sponsorships"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "welcome_pack_inclusions" ADD CONSTRAINT "welcome_pack_inclusions_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sponsored_conversation_cards" ADD CONSTRAINT "sponsored_conversation_cards_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partner_organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sponsored_conversation_cards" ADD CONSTRAINT "sponsored_conversation_cards_sponsorship_id_fkey" FOREIGN KEY ("sponsorship_id") REFERENCES "sponsorships"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sponsored_conversation_cards" ADD CONSTRAINT "sponsored_conversation_cards_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "host_kit_add_ons" ADD CONSTRAINT "host_kit_add_ons_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partner_organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "host_kit_add_ons" ADD CONSTRAINT "host_kit_add_ons_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "host_kit_requests" ADD CONSTRAINT "host_kit_requests_kit_id_fkey" FOREIGN KEY ("kit_id") REFERENCES "host_kit_add_ons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "host_kit_requests" ADD CONSTRAINT "host_kit_requests_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "host_kit_requests" ADD CONSTRAINT "host_kit_requests_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "hosts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "host_kit_requests" ADD CONSTRAINT "host_kit_requests_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partner_organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_reward_catalog_items" ADD CONSTRAINT "partner_reward_catalog_items_reward_catalog_item_id_fkey" FOREIGN KEY ("reward_catalog_item_id") REFERENCES "reward_catalog_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_reward_catalog_items" ADD CONSTRAINT "partner_reward_catalog_items_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partner_organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sponsor_product_feedback" ADD CONSTRAINT "sponsor_product_feedback_sponsorship_id_fkey" FOREIGN KEY ("sponsorship_id") REFERENCES "sponsorships"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sponsor_product_feedback" ADD CONSTRAINT "sponsor_product_feedback_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sponsor_product_feedback" ADD CONSTRAINT "sponsor_product_feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sponsor_product_feedback" ADD CONSTRAINT "sponsor_product_feedback_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partner_organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_leads" ADD CONSTRAINT "partner_leads_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partner_organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_leads" ADD CONSTRAINT "partner_leads_sponsorship_id_fkey" FOREIGN KEY ("sponsorship_id") REFERENCES "sponsorships"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_leads" ADD CONSTRAINT "partner_leads_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_leads" ADD CONSTRAINT "partner_leads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_invoices" ADD CONSTRAINT "partner_invoices_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partner_organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_invoice_line_items" ADD CONSTRAINT "partner_invoice_line_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "partner_invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "featured_placements" ADD CONSTRAINT "featured_placements_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partner_organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "featured_placements" ADD CONSTRAINT "featured_placements_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "partner_invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_analytics_snapshots" ADD CONSTRAINT "partner_analytics_snapshots_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partner_organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_exclusivity_locks" ADD CONSTRAINT "partner_exclusivity_locks_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partner_organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_audit_log" ADD CONSTRAINT "partner_audit_log_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partner_organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_audit_log" ADD CONSTRAINT "partner_audit_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
