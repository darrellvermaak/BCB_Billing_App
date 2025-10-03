import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';

import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
    let app: INestApplication<App>;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('POST /currencies', async () => {
        const response = await request(app.getHttpServer())
            .post('/currencies')
            .send({
                currency: 'GBP',
                monthlyFeeGbp: 15,
            })
            .expect(201); // or 200, depending on your controller

        console.log(response.body);
    });

    it('POST /accounts', async () => {
        const response = await request(app.getHttpServer())
            .post('/accounts')
            .send({
                accountId: '6f6bfefc-d1f7-4244-9747-af66fa5efcb1',
                currency: 'GBP',
                transactionThreshold: 20,
                discountDays: 15,
                discountRate: 15,
            })
            .expect(201); // or 200, depending on your controller

        console.log(response.body);
    });

    it('POST /accounts/:id/bill', async () => {
        const response = await request(app.getHttpServer())
            .post('/accounts/6f6bfefc-d1f7-4244-9747-af66fa5efcb1/bill')
            .send({
                billingPeriodStart: '2025-10-04',
                billingPeriodEnd: '2026-02-28',
                transactionCount: 400,
            });

        // Log for debugging no matter what
        console.log('Status:', response.status);
        console.log('Body:', response.body);

        // Assert last (so logs still print even if the test fails)
        expect(response.status).toBe(201);
    });
});
