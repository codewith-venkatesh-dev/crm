import { PrismaClient, LeadSource, LeadStatus, FollowUpType, ActivityType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing data
  await prisma.activity.deleteMany();
  await prisma.followUp.deleteMany();
  await prisma.lead.deleteMany();

  const now = new Date();
  
  // Helper dates
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // 1. Lead: Overdue follow-up (Contacted)
  const lead1 = await prisma.lead.create({
    data: {
      name: 'Sarah Jenkins',
      companyName: 'Apex Financial Technologies',
      email: 'sarah.j@apexfintech.io',
      phone: '+1 (555) 234-5678',
      source: LeadSource.WEBSITE,
      status: LeadStatus.CONTACTED,
      notes: 'Interested in enterprise seat licensing. Demo was delivered last Thursday.',
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
          },
          {
            title: 'Initial Discovery Call',
            description: 'Discussed key platform pain points and current CRM migration timeline',
            dueDate: threeDaysAgo,
            dueTime: '10:00',
            type: FollowUpType.CALL,
            isCompleted: true,
            completedAt: threeDaysAgo,
          }
        ]
      },
      activities: {
        create: [
          {
            type: ActivityType.SYSTEM,
            content: 'Lead created via Website contact form submission',
            createdAt: fiveDaysAgo,
          },
          {
            type: ActivityType.CALL,
            content: 'Had 30-minute discovery call with Sarah. She requested a custom enterprise quote.',
            createdAt: threeDaysAgo,
          },
          {
            type: ActivityType.STATUS_CHANGE,
            content: 'Status updated from NEW to CONTACTED',
            createdAt: threeDaysAgo,
          }
        ]
      }
    }
  });

  // 2. Lead: Due Today follow-up (Negotiating)
  const lead2 = await prisma.lead.create({
    data: {
      name: 'Michael Chen',
      companyName: 'Horizon Logistics Corp',
      email: 'm.chen@horizonlogistics.com',
      phone: '+1 (555) 876-5432',
      source: LeadSource.LINKEDIN,
      status: LeadStatus.NEGOTIATING,
      notes: 'Evaluating contract terms. Security review complete.',
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
          }
        ]
      },
      activities: {
        create: [
          {
            type: ActivityType.SYSTEM,
            content: 'Lead imported from LinkedIn campaign outreach',
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
          }
        ]
      }
    }
  });

  // 3. Lead: Closed Lead
  const lead3 = await prisma.lead.create({
    data: {
      name: 'Elena Rostova',
      companyName: 'Vanguard Retail Group',
      email: 'elena.rostova@vanguardretail.com',
      phone: '+1 (555) 345-6789',
      source: LeadSource.REFERRAL,
      status: LeadStatus.CLOSED,
      notes: 'Deal closed! Annual subscription paid. Onboarding scheduled.',
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
          },
          {
            title: 'Receive Signed Contract',
            description: 'Ensure signed master agreement is archived in drive',
            dueDate: yesterday,
            dueTime: '17:00',
            type: FollowUpType.TASK,
            isCompleted: true,
            completedAt: yesterday,
          }
        ]
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
          }
        ]
      }
    }
  });

  // 4. Lead: New Lead
  const lead4 = await prisma.lead.create({
    data: {
      name: 'David Miller',
      companyName: 'Nexus Cloud Systems',
      email: 'dave@nexuscloud.io',
      phone: '+1 (555) 987-6543',
      source: LeadSource.COLD_EMAIL,
      status: LeadStatus.NEW,
      notes: 'Responded positively to cold outreach campaign. Asking for product specs.',
      createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000), // 4 hours ago
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
          }
        ]
      },
      activities: {
        create: [
          {
            type: ActivityType.EMAIL,
            content: 'Received reply from outbound cold sequence asking for API documentation.',
            createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
          }
        ]
      }
    }
  });

  // 5. Lead: Lost Lead
  const lead5 = await prisma.lead.create({
    data: {
      name: 'Amanda Martinez',
      companyName: 'Solaris Energy Solutions',
      email: 'amanda.m@solarisenergy.com',
      phone: '+1 (555) 456-7890',
      source: LeadSource.ADVERTISEMENT,
      status: LeadStatus.LOST,
      notes: 'Chose a competitor due to legacy system integration constraints.',
      createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      updatedAt: fiveDaysAgo,
      activities: {
        create: [
          {
            type: ActivityType.STATUS_CHANGE,
            content: 'Lead marked as LOST. Reason: Needed specialized AS400 connector.',
            createdAt: fiveDaysAgo,
          }
        ]
      }
    }
  });

  // 6. Lead: Contacted with upcoming WhatsApp follow-up
  const lead6 = await prisma.lead.create({
    data: {
      name: 'Robert Taylor',
      companyName: 'Global Transit Logistics',
      email: 'rtaylor@globaltransit.net',
      phone: '+1 (555) 654-3210',
      source: LeadSource.WHATSAPP,
      status: LeadStatus.CONTACTED,
      notes: 'Prefers communication over WhatsApp. Requested high-level pitch video.',
      createdAt: twoDaysAgo,
      updatedAt: yesterday,
      followUps: {
        create: [
          {
            title: 'Send Demo Video via WhatsApp',
            description: 'Share loom video walk-through of team collaboration features',
            dueDate: tomorrow,
            dueTime: '14:00',
            type: FollowUpType.WHATSAPP,
            isCompleted: false,
          }
        ]
      },
      activities: {
        create: [
          {
            type: ActivityType.WHATSAPP,
            content: 'Initial contact via WhatsApp business line.',
            createdAt: twoDaysAgo,
          }
        ]
      }
    }
  });

  // 7. Lead: Negotiating
  const lead7 = await prisma.lead.create({
    data: {
      name: 'Priya Sharma',
      companyName: 'Innovate Healthcare Tech',
      email: 'priya.sharma@innovatehealth.org',
      phone: '+1 (555) 789-0123',
      source: LeadSource.PHONE_CALL,
      status: LeadStatus.NEGOTIATING,
      notes: 'Finalizing HIPAA compliance documentation and custom data retention terms.',
      createdAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
      updatedAt: yesterday,
      followUps: {
        create: [
          {
            title: 'Security Compliance Sign-off',
            description: 'Obtain signed BAA and security audit agreement from compliance lead',
            dueDate: nextWeek,
            dueTime: '16:00',
            type: FollowUpType.TASK,
            isCompleted: false,
          }
        ]
      },
      activities: {
        create: [
          {
            type: ActivityType.CALL,
            content: 'Inbound phone call regarding enterprise tier data residency options.',
            createdAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
          }
        ]
      }
    }
  });

  // 8. Lead: New
  const lead8 = await prisma.lead.create({
    data: {
      name: 'James Wilson',
      companyName: 'Apex CyberSec',
      email: 'j.wilson@apexcyber.io',
      phone: '+1 (555) 890-1234',
      source: LeadSource.OTHER,
      status: LeadStatus.NEW,
      notes: 'Met at Tech Summit San Francisco booth.',
      createdAt: yesterday,
      updatedAt: yesterday,
      activities: {
        create: [
          {
            type: ActivityType.NOTE,
            content: 'Exchanged business cards at Tech Summit booth 402.',
            createdAt: yesterday,
          }
        ]
      }
    }
  });

  console.log(`✅ Database successfully seeded with 8 sample leads!`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
