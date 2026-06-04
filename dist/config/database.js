"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("../generated/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = __importDefault(require("pg"));
if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is missing. Copy .env.example to .env and set your PostgreSQL connection string.');
}
const adapter = new adapter_pg_1.PrismaPg(new pg_1.default.Pool({ connectionString: process.env.DATABASE_URL }));
const prisma = new client_1.PrismaClient({ adapter });
exports.default = prisma;
