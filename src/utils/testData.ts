/**
 * Test Data Generation Utilities
 * Generate realistic test data for development and testing
 * Following Lovable best practices for development workflow
 */

import { faker } from '@faker-js/faker';
import type {
  ClientProfile,
  StylistProfile,
  Appointment,
  Formula,
  StylistService,
  Review,
} from '@/types/common';

/**
 * Generate a test client profile
 */
export function generateTestClient(
  overrides?: Partial<ClientProfile>
): Omit<ClientProfile, 'id' | 'created_at' | 'updated_at'> {
  return {
    user_id: faker.string.uuid(),
    full_name: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    phone: faker.phone.number(),
    preferred_stylist_id: null,
    hair_type: faker.helpers.arrayElement([
      'straight',
      'wavy',
      'curly',
      'coily',
    ]),
    allergies:
      faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.3 }) ||
      null,
    notes:
      faker.helpers.maybe(() => faker.lorem.paragraph(), {
        probability: 0.5,
      }) || null,
    medical_info_consent: faker.datatype.boolean(),
    birthday: faker.date
      .birthdate({ min: 18, max: 80, mode: 'age' })
      .toISOString()
      .split('T')[0],
    hair_goals: faker.helpers.arrayElement([
      'Maintain healthy hair',
      'Grow hair longer',
      'Add volume',
      'Reduce frizz',
      'Change color',
    ]),
    preferred_time_of_day: faker.helpers.arrayElement([
      'morning',
      'afternoon',
      'evening',
    ]),
    referral_source: faker.helpers.arrayElement([
      'Instagram',
      'Google',
      'Friend',
      'Walk-in',
    ]),
    client_since: faker.date.past({ years: 2 }).toISOString().split('T')[0],
    preferred_stylist_notes: null,
    sensitivity_notes:
      faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.2 }) ||
      null,
    communication_preference: faker.helpers.arrayElement([
      'app',
      'email',
      'phone',
    ]),
    appointment_reminders_enabled: true,
    special_requests:
      faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.3 }) ||
      null,
    ...overrides,
  };
}

/**
 * Generate a test stylist profile
 */
export function generateTestStylist(
  overrides?: Partial<StylistProfile>
): Partial<StylistProfile> {
  return {
    user_id: faker.string.uuid(),
    business_name: faker.company.name() + ' Hair Studio',
    bio: faker.lorem.paragraphs(2),
    color_line: faker.helpers.arrayElement([
      'Wella',
      'Redken',
      'Paul Mitchell',
      'Schwarzkopf',
    ]),
    years_experience: faker.number.int({ min: 1, max: 20 }),
    specialty: faker.helpers.arrayElement([
      'Color correction',
      'Balayage',
      'Curly hair',
      'Extensions',
      'Keratin treatments',
    ]),
    location:
      faker.location.city() +
      ', ' +
      faker.location.state({ abbreviated: true }),
    commission_rate: faker.number.float({
      min: 40,
      max: 70,
      fractionDigits: 0,
    }),
    is_available: true,
    average_rating: faker.number.float({
      min: 4.0,
      max: 5.0,
      fractionDigits: 1,
    }),
    total_reviews: faker.number.int({ min: 5, max: 150 }),
    buffer_time_minutes: faker.helpers.arrayElement([15, 30, 45]),
    is_public_listing: true,
    instant_booking_enabled: faker.datatype.boolean(),
    social_media_instagram: `@${faker.internet.username()}`,
    social_media_tiktok:
      faker.helpers.maybe(() => `@${faker.internet.username()}`, {
        probability: 0.5,
      }) || null,
    preferred_communication: 'app',
    timezone: 'America/New_York',
    cancellation_policy:
      '24 hours notice required for cancellations to avoid a fee',
    deposit_required: faker.datatype.boolean(),
    accepts_new_clients: true,
    booking_page_active: true,
    ...overrides,
  };
}

/**
 * Generate a test appointment
 */
export function generateTestAppointment(
  stylistId: string,
  clientId: string,
  overrides?: Partial<Appointment>
): Omit<Appointment, 'id' | 'created_at' | 'updated_at'> {
  const appointmentDate = faker.date.soon({ days: 30 });
  const status = faker.helpers.arrayElement([
    'scheduled',
    'confirmed',
    'completed',
  ] as const);

  return {
    stylist_id: stylistId,
    client_id: clientId,
    appointment_date: appointmentDate.toISOString(),
    duration_minutes: faker.helpers.arrayElement([60, 90, 120, 180]),
    service_type: faker.helpers.arrayElement([
      'Color',
      'Cut',
      'Color + Cut',
      'Highlights',
      'Balayage',
      'Treatment',
    ]),
    status,
    notes:
      faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.4 }) ||
      null,
    service_id: null,
    reminder_sent: status !== 'scheduled',
    cancellation_reason: null,
    cancelled_at: null,
    followup_sent: status === 'completed' ? faker.datatype.boolean() : false,
    rebook_reminder_sent: false,
    confirmation_requested_48h: false,
    confirmation_requested_24h: false,
    confirmed_by_client: false,
    confirmed_at: null,
    ...overrides,
  };
}

/**
 * Generate a test formula
 */
export function generateTestFormula(
  stylistId: string,
  clientId: string,
  overrides?: Partial<Formula>
): Partial<Formula> {
  return {
    stylist_id: stylistId,
    client_id: clientId,
    formula_text: faker.helpers.arrayElement([
      'Natural Brown with Caramel Highlights',
      'Platinum Blonde',
      'Dimensional Brunette',
      'Copper Red',
      'Ash Blonde Balayage',
    ]),
    color_line: faker.helpers.arrayElement([
      'Wella',
      'Redken',
      'Paul Mitchell',
    ]),
    developer_volume: faker.helpers.arrayElement([
      '20 vol',
      '30 vol',
      '40 vol',
    ]),
    processing_time_minutes: faker.number.int({ min: 20, max: 45 }),
    application_notes:
      faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.6 }) ||
      null,
    instructions: faker.lorem.paragraph(),
    what_worked:
      faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.5 }) ||
      null,
    tags: faker.helpers.arrayElements(
      ['blonde', 'brunette', 'red', 'highlights', 'lowlights'],
      { min: 1, max: 3 }
    ),
    ...overrides,
  };
}

/**
 * Generate a test service
 */
export function generateTestService(
  stylistId: string,
  overrides?: Partial<StylistService>
): Partial<StylistService> {
  const name = faker.helpers.arrayElement([
    'Haircut',
    'Color',
    'Highlights',
    'Balayage',
    'Deep Conditioning Treatment',
    'Keratin Treatment',
    'Hair Extensions',
  ]);

  const priceMap: Record<string, number> = {
    Haircut: 65,
    Color: 120,
    Highlights: 180,
    Balayage: 220,
    'Deep Conditioning Treatment': 45,
    'Keratin Treatment': 300,
    'Hair Extensions': 500,
  };

  return {
    stylist_id: stylistId,
    service_name: name,
    description: faker.lorem.sentence(),
    duration_minutes: faker.helpers.arrayElement([60, 90, 120, 180, 240]),
    price: priceMap[name] || 100,
    require_deposit: faker.datatype.boolean(),
    deposit_amount: faker.helpers.maybe(() => 50, { probability: 0.5 }) || null,
    is_active: true,
    ...overrides,
  };
}

/**
 * Generate a test review
 */
export function generateTestReview(
  stylistId: string,
  clientId: string,
  appointmentId: string,
  overrides?: Partial<Review>
): Partial<Review> {
  const rating = faker.number.int({ min: 4, max: 5 });

  const positiveComments = [
    'Amazing experience! My hair looks incredible.',
    "Best stylist I've ever been to. Highly recommend!",
    'Perfect color match. Exactly what I wanted!',
    'So professional and talented. Love my new look!',
    'Great atmosphere and excellent results.',
  ];

  return {
    stylist_id: stylistId,
    client_id: clientId,
    appointment_id: appointmentId || null,
    rating,
    review_text: faker.helpers.arrayElement(positiveComments),
    ...overrides,
  };
}

/**
 * Generate a complete test dataset
 */
export interface TestDataset {
  stylists: Array<Partial<StylistProfile>>;
  clients: Array<Partial<ClientProfile>>;
  appointments: Array<Partial<Appointment>>;
  formulas: Array<Partial<Formula>>;
  services: Array<Partial<StylistService>>;
}

export function generateTestDataset(options?: {
  numStylists?: number;
  numClientsPerStylist?: number;
  numAppointmentsPerClient?: number;
}): TestDataset {
  const {
    numStylists = 2,
    numClientsPerStylist = 5,
    numAppointmentsPerClient = 3,
  } = options || {};

  const dataset: TestDataset = {
    stylists: [],
    clients: [],
    appointments: [],
    formulas: [],
    services: [],
  };

  // Generate stylists
  for (let i = 0; i < numStylists; i++) {
    const stylist = generateTestStylist();
    dataset.stylists.push(stylist);

    // Generate services for stylist
    for (let j = 0; j < 5; j++) {
      dataset.services.push(generateTestService(stylist.user_id));
    }

    // Generate clients for this stylist
    for (let j = 0; j < numClientsPerStylist; j++) {
      const client = generateTestClient({
        preferred_stylist_id: stylist.user_id,
      });
      dataset.clients.push(client);

      // Generate appointments for this client
      for (let k = 0; k < numAppointmentsPerClient; k++) {
        const appointment = generateTestAppointment(
          stylist.user_id,
          client.user_id!
        );
        dataset.appointments.push(appointment);

        // Generate formula for some appointments
        if (faker.datatype.boolean()) {
          dataset.formulas.push(
            generateTestFormula(stylist.user_id, client.user_id!)
          );
        }
      }
    }
  }

  return dataset;
}
