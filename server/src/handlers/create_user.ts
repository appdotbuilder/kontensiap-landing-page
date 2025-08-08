import { type CreateUserInput, type User } from '../schema';

export async function createUser(input: CreateUserInput): Promise<User> {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is creating a new user and persisting it in the database.
    // Should also create a default free subscription for the user.
    return Promise.resolve({
        id: 0, // Placeholder ID
        email: input.email,
        name: input.name,
        business_type: input.business_type,
        business_name: input.business_name,
        created_at: new Date(),
        updated_at: new Date()
    } as User);
}