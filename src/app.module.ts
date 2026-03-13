import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { HostsModule } from './hosts/hosts.module';
import { ApplicationsModule } from './applications/applications.module';
import { SessionsModule } from './sessions/sessions.module';
import { GuestsModule } from './guests/guests.module';
import { RecapsModule } from './recaps/recaps.module';
import { FeedbackModule } from './feedback/feedback.module';
import { RewardsModule } from './rewards/rewards.module';
import { NotificationsModule } from './notifications/notifications.module';
import { WelcomePacksModule } from './welcome-packs/welcome-packs.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AdminModule } from './admin/admin.module';
import { PartnersModule } from './partners/partners.module';
import { PartnerBillingModule } from './partner-billing/partner-billing.module';
import { SponsorshipsModule } from './sponsorships/sponsorships.module';
import { WelcomePackInclusionsModule } from './welcome-pack-inclusions/welcome-pack-inclusions.module';
import { SponsoredCardsModule } from './sponsored-cards/sponsored-cards.module';
import { HostKitsModule } from './host-kits/host-kits.module';
import { PartnerLeadsModule } from './partner-leads/partner-leads.module';
import { PartnerAnalyticsModule } from './partner-analytics/partner-analytics.module';
import { FeaturedPlacementsModule } from './featured-placements/featured-placements.module';
import { PartnerRewardsModule } from './partner-rewards/partner-rewards.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    HostsModule,
    ApplicationsModule,
    SessionsModule,
    GuestsModule,
    RecapsModule,
    FeedbackModule,
    RewardsModule,
    NotificationsModule,
    WelcomePacksModule,
    AnalyticsModule,
    AdminModule,
    PartnersModule,
    PartnerBillingModule,
    SponsorshipsModule,
    WelcomePackInclusionsModule,
    SponsoredCardsModule,
    HostKitsModule,
    PartnerLeadsModule,
    PartnerAnalyticsModule,
    FeaturedPlacementsModule,
    PartnerRewardsModule,
  ],
})
export class AppModule {}
