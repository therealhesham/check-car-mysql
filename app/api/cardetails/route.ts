import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Fetch all cars with pagination, search, or a single car by ID
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get('id');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const searchQuery = searchParams.get('search') || '';

    try {
        // If an ID is provided, return the specific car
        if (idParam) {
            const id = parseInt(idParam, 10);
            if (isNaN(id)) {
                return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
            }

            const car = await prisma.carsDetails.findUnique({
                where: { id },
            });

            if (!car) {
                return NextResponse.json({ error: 'Car not found' }, { status: 404 });
            }

            return NextResponse.json(car);
        }

        // Build search filter
        const searchFilter = searchQuery
            ? {
                OR: [
                    { owner_name: { contains: searchQuery } },
                    { manufacturer: { contains: searchQuery } },
                    { model: { contains: searchQuery } },
                    { plate: { contains: searchQuery } },
                    { color: { contains: searchQuery } },
                ],
            }
            : {};

        // Fetch paginated and filtered cars
        const cars = await prisma.carsDetails.findMany({
            where: searchFilter,
            skip: (page - 1) * pageSize,
            take: pageSize,
            orderBy: { id: 'asc' },
        });

        const total = await prisma.carsDetails.count({
            where: searchFilter,
        });

        return NextResponse.json({
            cars,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        });
    } catch (error) {
        console.error('Error fetching cars:', error);
        return NextResponse.json({ error: 'Failed to fetch cars' }, { status: 500 });
    }
}

// POST: Create a new car
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const car = await prisma.carsDetails.create({
            data: {
                owner_name: body.owner_name,
                specification_policy: body.specification_policy,
                Ref: parseInt(body.Ref),
                make_no: parseInt(body.make_no, 10) || null,
                manufacturer: body.manufacturer,
                model_no: parseInt(body.model_no) || null,
                model: body.model,
                type_no: body.type_no,
                Type: body.Type,
                seats: body.seats ? parseInt(body.seats) : null,
                manufacturing_year: body.manufacturing_year ? parseInt(body.manufacturing_year) : null,
                plate: body.plate,
                sequance: body.sequance,
                chassis: body.chassis,
                excess: body.excess ? parseInt(body.excess) : null,
                color: body.color,
                sum_insured: body.sum_insured ? parseFloat(body.sum_insured) : null,
                premium: body.premium ? parseFloat(body.premium) : null,
            },
        });
        return NextResponse.json(car, { status: 201 });
    } catch (error) {
        console.error('Error creating car:', error);
        return NextResponse.json({ error: 'Failed to create car' }, { status: 500 });
    }
}

// PUT: Update a car by ID
export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, ...data } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const car = await prisma.carsDetails.update({
            where: { id: parseInt(id) },
            data: {
                owner_name: data.owner_name,
                specification_policy: data.specification_policy,
                Ref: data.Ref,
                make_no: data.make_no,
                manufacturer: data.manufacturer,
                model_no: data.model_no,
                model: data.model,
                type_no: data.type_no,
                Type: data.Type,
                seats: data.seats ? parseInt(data.seats) : null,
                manufacturing_year: data.manufacturing_year ? parseInt(data.manufacturing_year) : null,
                plate: data.plate,
                sequance: data.sequance,
                chassis: data.chassis,
                excess: data.excess ? parseInt(data.excess) : null,
                color: data.color,
                sum_insured: data.sum_insured ? parseFloat(data.sum_insured) : null,
                premium: data.premium ? parseFloat(data.premium) : null,
            },
        });
        return NextResponse.json(car);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update car' }, { status: 500 });
    }
}

// DELETE: Delete a car by ID
export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    try {
        await prisma.carsDetails.delete({
            where: { id: parseInt(id) },
        });
        return NextResponse.json({ message: 'Car deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete car' }, { status: 500 });
    }
}