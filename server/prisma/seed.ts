import { PrismaClient, LeadSource, LeadStatus, FollowUpType, ActivityType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding with users & auth...');

  // Clean existing data
  await prisma.activity.deleteMany();
  await prisma.followUp.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.user.deleteMany();

  // Create hashed default passwords
  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create Super Admin User (userRight = 1)
  const adminUser = await prisma.user.create({
    data: {
      name: 'Anu (Super Admin)',
      email: 'admin@crm.com',
      password: passwordHash,
      userRight: 1,
    },
  });

  // 2. Create Normal Sales Agent User (userRight = 0)
  const agentUser = await prisma.user.create({
    data: {
      name: 'Rajan (Sales Representative)',
      email: 'agent@crm.com',
      password: passwordHash,
      userRight: 0,
    },
  });

  console.log(`👤 Created Users:
  - Super Admin: admin@crm.com (Password: password123, userRight: 1)
  - Sales Agent: agent@crm.com (Password: password123, userRight: 0)`);

  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // 1. Lead: Overdue follow-up with closure outcome note
  await prisma.lead.create({
    data: {
      name: 'Sarah Jenkins',
      companyName: 'Apex Financial Technologies',
      email: 'sarah.j@apexfintech.io',
      phone: '+91 9876543210',
      source: LeadSource.WEBSITE,
      status: LeadStatus.CONTACTED,
      notes: 'Interested in enterprise seat licensing. Demo was delivered last Thursday.',
      createdById: adminUser.id,
      createdAt: fiveDaysAgo,
      updatedAt: yesterday,
      followUps: {
        create: [
          {
            title: 'Send Revised Enterprise Proposal',
            description: 'Send updated pricing breakdown including premium support tier',
            dueDate: yesterday,
            dueTime: '14:00',
            type: FollowUpType.EMAIL,
            isCompleted: false,
            createdById: adminUser.id,
            assignedToId: agentUser.id,
          },
          {
            title: 'Initial Discovery Call',
            description: 'Discussed key platform pain points and current CRM migration timeline',
            dueDate: threeDaysAgo,
            dueTime: '10:00',
            type: FollowUpType.CALL,
            isCompleted: true,
            completedAt: threeDaysAgo,
            completionNote: 'Completed 30-min call. Customer has 50 reps and requires custom SSO integration.',
            createdById: adminUser.id,
            assignedToId: agentUser.id,
            completedById: agentUser.id,
          },
        ],
      },
      activities: {
        create: [
          {
            type: ActivityType.SYSTEM,
            content: 'Lead created by Alex Vance via Website contact form submission',
            createdAt: fiveDaysAgo,
          },
          {
            type: ActivityType.CALL,
            content: 'Discovery call outcome: Customer has 50 reps and requires custom SSO integration.',
            createdAt: threeDaysAgo,
          },
          {
            type: ActivityType.STATUS_CHANGE,
            content: 'Status updated from NEW to CONTACTED',
            createdAt: threeDaysAgo,
          },
        ],
      },
    },
  });

  // 2. Lead: Due Today follow-up (Negotiating)
  await prisma.lead.create({
    data: {
      name: 'Michael Chen',
      companyName: 'Horizon Logistics Corp',
      email: 'm.chen@horizonlogistics.com',
      phone: '+91 9876543210',
      source: LeadSource.LINKEDIN,
      status: LeadStatus.NEGOTIATING,
      notes: 'Evaluating contract terms. Security review complete.',
      createdById: agentUser.id,
      createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      updatedAt: now,
      followUps: {
        create: [
          {
            title: 'Contract Review Call',
            description: 'Review SLA terms and final subscription discount with legal lead',
            dueDate: now,
            dueTime: '15:30',
            type: FollowUpType.MEETING,
            isCompleted: false,
            createdById: agentUser.id,
            assignedToId: agentUser.id,
          },
        ],
      },
      activities: {
        create: [
          {
            type: ActivityType.SYSTEM,
            content: 'Lead added by Jordan Lee from LinkedIn campaign outreach',
            createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
          },
          {
            type: ActivityType.MEETING,
            content: 'Product demo presented to CTO and Procurement team.',
            createdAt: fiveDaysAgo,
          },
          {
            type: ActivityType.STATUS_CHANGE,
            content: 'Status changed from CONTACTED to NEGOTIATING',
            createdAt: twoDaysAgo,
          },
        ],
      },
    },
  });

  // 3. Lead: Closed Lead with completed follow-up outcome note
  await prisma.lead.create({
    data: {
      name: 'Ravi Kumar',
      companyName: 'Vanguard Retail Group',
      email: 'elena.rostova@vanguardretail.com',
      phone: '+91 9876543210',
      source: LeadSource.REFERRAL,
      status: LeadStatus.CLOSED,
      notes: 'Deal closed! Annual subscription paid. Onboarding scheduled.',
      createdById: adminUser.id,
      createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
      updatedAt: yesterday,
      followUps: {
        create: [
          {
            title: 'Kickoff Onboarding Session',
            description: 'Set up user accounts and run staff training workshop',
            dueDate: nextWeek,
            dueTime: '11:00',
            type: FollowUpType.MEETING,
            isCompleted: false,
            createdById: adminUser.id,
            assignedToId: adminUser.id,
          },
          {
            title: 'Receive Signed Contract',
            description: 'Ensure signed master agreement is archived in drive',
            dueDate: yesterday,
            dueTime: '17:00',
            type: FollowUpType.TASK,
            isCompleted: true,
            completedAt: yesterday,
            completionNote: 'Master Service Agreement signed by VP Elena Rostova. Initial payment confirmed via wire.',
            createdById: adminUser.id,
            assignedToId: adminUser.id,
            completedById: adminUser.id,
          },
        ],
      },
      activities: {
        create: [
          {
            type: ActivityType.NOTE,
            content: 'Referred by Dave Miller from TechPartners Inc.',
            createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
          },
          {
            type: ActivityType.STATUS_CHANGE,
            content: 'Status updated to CLOSED. Signed contract received!',
            createdAt: yesterday,
          },
        ],
      },
    },
  });

  // 4. Lead: New Lead
  await prisma.lead.create({
    data: {
      name: 'John Doe',
      companyName: 'Nexus Cloud Systems',
      email: 'john.doe@nexuscloud.io',
      phone: '+91 9876543210',
      source: LeadSource.COLD_EMAIL,
      status: LeadStatus.NEW,
      notes: 'Responded positively to cold outreach campaign. Asking for product specs.',
      createdById: agentUser.id,
      createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
      followUps: {
        create: [
          {
            title: 'Send Product Specs & Brochure',
            description: 'Reply to Dave with technical whitepaper and pricing overview',
            dueDate: tomorrow,
            dueTime: '09:30',
            type: FollowUpType.EMAIL,
            isCompleted: false,
            createdById: agentUser.id,
            assignedToId: agentUser.id,
          },
        ],
      },
      activities: {
        create: [
          {
            type: ActivityType.EMAIL,
            content: 'Received reply from outbound cold sequence asking for API documentation.',
            createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
          },
        ],
      },
    },
  });

  console.log('✅ Database successfully seeded with users and leads!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
