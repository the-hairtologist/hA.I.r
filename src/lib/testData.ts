/**
 * Test Data Generation
 * Utilities for seeding development data
 */

import { supabase } from '@/integrations/supabase/client';
import { faker } from '@faker-js/faker';
import { addDays, addHours, startOfDay } from 'date-fns';

interface TestClient {
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  hair_type?: string;
  allergies?: string;
  notes?: string;
}

interface TestAppointment {
  stylist_id: string;
  client_id: string;
  service_type: string;
  appointment_date: string;
  duration_minutes: number;
  status: string;
  notes?: string;
}

interface TestFormula {
  stylist_id: string;
  client_id: string;
  formula_text: string;
  products_used?: string;
  notes?: string;
}

class TestDataGenerator {
  /**
   * Generate test clients
   */
  async generateClients(userId: string, count: number = 5): Promise<any[]> {
    const clients: TestClient[] = [];

    for (let i = 0; i < count; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();

      clients.push({
        user_id: userId,
        full_name: `${firstName} ${lastName}`,
        email: faker.internet.email({ firstName, lastName }).toLowerCase(),
        phone: faker.phone.number(),
        hair_type: faker.helpers.arrayElement([
          'straight',
          'wavy',
          'curly',
          'coily',
        ]),
        allergies: faker.datatype.boolean()
          ? faker.helpers.arrayElement(['None', 'PPD', 'Ammonia', 'Fragrance'])
          : null,
        notes: faker.datatype.boolean() ? faker.lorem.sentence() : null,
      });
    }

    const { data, error } = await supabase
      .from('client_profiles')
      .insert(clients)
      .select();

    if (error) throw error;
    return data || [];
  }

  /**
   * Generate test appointments
   */
  async generateAppointments(
    stylistId: string,
    clientIds: string[],
    count: number = 10
  ): Promise<any[]> {
    if (clientIds.length === 0) {
      throw new Error('No client IDs provided');
    }

    const appointments: TestAppointment[] = [];
    const today = startOfDay(new Date());

    for (let i = 0; i < count; i++) {
      // Mix of past and future appointments
      const daysOffset = faker.number.int({ min: -30, max: 30 });
      const appointmentDate = addDays(today, daysOffset);
      const hour = faker.number.int({ min: 9, max: 17 });
      const finalDate = addHours(appointmentDate, hour);

      appointments.push({
        stylist_id: stylistId,
        client_id: faker.helpers.arrayElement(clientIds),
        service_type: faker.helpers.arrayElement([
          'Color',
          'Cut & Style',
          'Highlights',
          'Balayage',
          'Treatment',
        ]),
        appointment_date: finalDate.toISOString(),
        duration_minutes: faker.helpers.arrayElement([60, 90, 120, 180]),
        status: faker.helpers.arrayElement([
          'scheduled',
          'confirmed',
          'completed',
          'cancelled',
        ]),
        notes: faker.datatype.boolean() ? faker.lorem.sentence() : null,
      });
    }

    const { data, error } = await supabase
      .from('appointments')
      .insert(appointments)
      .select();

    if (error) throw error;
    return data || [];
  }

  /**
   * Generate test formulas
   */
  async generateFormulas(
    stylistId: string,
    clientIds: string[],
    count: number = 5
  ): Promise<any[]> {
    if (clientIds.length === 0) {
      throw new Error('No client IDs provided');
    }

    const formulas: TestFormula[] = [];
    const colors = ['Natural', 'Golden', 'Ash', 'Red', 'Violet', 'Copper'];
    const levels = ['6', '7', '8', '9', '10'];

    for (let i = 0; i < count; i++) {
      const color = faker.helpers.arrayElement(colors);
      const level = faker.helpers.arrayElement(levels);

      formulas.push({
        stylist_id: stylistId,
        client_id: faker.helpers.arrayElement(clientIds),
        formula_text: `${level} ${color}`,
        products_used: faker.helpers
          .arrayElements(
            [
              '40 Vol Developer',
              '20 Vol Developer',
              '10 Vol Developer',
              'Toner',
              'Bond Protector',
              'Color Base',
            ],
            { min: 2, max: 4 }
          )
          .join(', '),
        notes: faker.datatype.boolean() ? faker.lorem.sentence() : null,
      });
    }

    const { data, error } = await supabase
      .from('formulas')
      .insert(formulas)
      .select();

    if (error) throw error;
    return data || [];
  }

  /**
   * Clear all test data
   */
  async clearTestData(): Promise<void> {
    // Delete in correct order to respect foreign key constraints
    await supabase
      .from('formulas')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase
      .from('appointments')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase
      .from('client_profiles')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
  }
}

export const seedTestData = new TestDataGenerator();
