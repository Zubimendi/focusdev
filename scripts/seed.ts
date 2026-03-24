/**
 * Database Seed Script for FocusDev
 * 
 * Usage: npx tsx scripts/seed.ts
 * 
 * Creates a demo user with sample tasks and focus sessions.
 * Requires MONGODB_URI environment variable.
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is required');
  process.exit(1);
}

// ── Schemas (inline to avoid import issues with monorepo) ──

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, trim: true },
    image: { type: String },
    password: { type: String, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true }
);
UserSchema.index({ email: 1 }, { unique: true });

const TaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['todo', 'in_progress', 'done'], default: 'todo' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    dueDate: { type: Date },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

const FocusSessionSchema = new mongoose.Schema(
  {
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    duration: { type: Number },
    notes: { type: String },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Task = mongoose.models.Task || mongoose.model('Task', TaskSchema);
const FocusSession = mongoose.models.FocusSession || mongoose.model('FocusSession', FocusSessionSchema);

// ── Seed Data ──

async function seed() {
  console.log('🌱 Connecting to database...');
  await mongoose.connect(MONGODB_URI!);
  console.log('✅ Connected successfully');

  // Clear existing demo data
  const existingUser = await User.findOne({ email: 'demo@focusdev.com' });
  if (existingUser) {
    console.log('🧹 Clearing existing demo data...');
    await Task.deleteMany({ userId: existingUser._id });
    await FocusSession.deleteMany({ userId: existingUser._id });
    await User.deleteOne({ _id: existingUser._id });
  }

  // Create demo user
  console.log('👤 Creating demo user...');
  const hashedPassword = await bcrypt.hash('password123', 12);
  const user = await User.create({
    email: 'demo@focusdev.com',
    name: 'Demo Developer',
    password: hashedPassword,
    role: 'user',
  });
  console.log(`   ✅ User created: ${user.email} (password: password123)`);

  // Create tasks
  console.log('📋 Creating sample tasks...');
  const now = new Date();
  const tasks = await Task.insertMany([
    {
      title: 'Refactor authentication middleware',
      description: 'Consolidate auth logic into a single middleware function supporting both JWT and session-based auth.',
      status: 'done',
      priority: 'high',
      userId: user._id,
    },
    {
      title: 'Implement WebSocket notifications',
      description: 'Add real-time notification system using Socket.io for focus session updates.',
      status: 'in_progress',
      priority: 'high',
      dueDate: new Date(now.getTime() + 2 * 86400000), // 2 days from now
      userId: user._id,
    },
    {
      title: 'Design system documentation',
      description: 'Document all color tokens, typography scales, and component patterns for the Monolithic Clarity theme.',
      status: 'in_progress',
      priority: 'medium',
      dueDate: new Date(now.getTime() + 5 * 86400000),
      userId: user._id,
    },
    {
      title: 'Write unit tests for task CRUD',
      description: 'Cover all edge cases: unauthorized access, invalid IDs, partial updates.',
      status: 'todo',
      priority: 'high',
      dueDate: new Date(now.getTime() + 1 * 86400000),
      userId: user._id,
    },
    {
      title: 'Setup CI/CD pipeline',
      description: 'Configure GitHub Actions for automated testing and Vercel deployment.',
      status: 'todo',
      priority: 'medium',
      dueDate: new Date(now.getTime() + 7 * 86400000),
      userId: user._id,
    },
    {
      title: 'Optimize MongoDB queries',
      description: 'Add compound indexes for frequently queried fields and reduce N+1 queries.',
      status: 'todo',
      priority: 'low',
      userId: user._id,
    },
    {
      title: 'Implement dark mode toggle',
      description: 'Add system preference detection and manual override for theme switching.',
      status: 'done',
      priority: 'medium',
      userId: user._id,
    },
    {
      title: 'API rate limiting',
      description: 'Implement rate limiting on auth endpoints to prevent brute force attacks.',
      status: 'todo',
      priority: 'high',
      dueDate: new Date(now.getTime() + 3 * 86400000),
      userId: user._id,
    },
    {
      title: 'Mobile offline support',
      description: 'Cache tasks locally and sync when connection is restored.',
      status: 'todo',
      priority: 'low',
      userId: user._id,
    },
    {
      title: 'Performance audit with Lighthouse',
      description: 'Run Lighthouse audit and fix all critical performance issues.',
      status: 'done',
      priority: 'medium',
      userId: user._id,
    },
  ]);
  console.log(`   ✅ Created ${tasks.length} tasks`);

  // Create focus sessions
  console.log('⏱️  Creating sample focus sessions...');
  const sessions = await FocusSession.insertMany([
    {
      taskId: tasks[0]._id,
      userId: user._id,
      startTime: new Date(now.getTime() - 6 * 3600000), // 6 hours ago
      endTime: new Date(now.getTime() - 5.25 * 3600000),
      duration: 45,
      notes: 'Completed auth middleware refactor. Clean implementation.',
    },
    {
      taskId: tasks[1]._id,
      userId: user._id,
      startTime: new Date(now.getTime() - 4 * 3600000),
      endTime: new Date(now.getTime() - 3.58 * 3600000),
      duration: 25,
      notes: 'Started WebSocket integration. Set up event handlers.',
    },
    {
      taskId: tasks[2]._id,
      userId: user._id,
      startTime: new Date(now.getTime() - 3 * 3600000),
      endTime: new Date(now.getTime() - 2.75 * 3600000),
      duration: 15,
      notes: 'Documented color token system.',
    },
    {
      taskId: tasks[6]._id,
      userId: user._id,
      startTime: new Date(now.getTime() - 26 * 3600000), // Yesterday
      endTime: new Date(now.getTime() - 25.5 * 3600000),
      duration: 30,
      notes: 'Implemented CSS custom properties for theme switching.',
    },
    {
      taskId: tasks[9]._id,
      userId: user._id,
      startTime: new Date(now.getTime() - 50 * 3600000), // 2 days ago
      endTime: new Date(now.getTime() - 49.25 * 3600000),
      duration: 45,
      notes: 'Fixed LCP and CLS issues. Score improved to 95.',
    },
    {
      taskId: tasks[3]._id,
      userId: user._id,
      startTime: new Date(now.getTime() - 1.5 * 3600000),
      endTime: new Date(now.getTime() - 1 * 3600000),
      duration: 30,
      notes: 'Wrote tests for GET and POST endpoints.',
    },
    {
      taskId: tasks[1]._id,
      userId: user._id,
      startTime: new Date(now.getTime() - 0.5 * 3600000),
      endTime: new Date(now.getTime() - 0.08 * 3600000),
      duration: 25,
      notes: 'WebSocket connection pooling and error handling.',
    },
  ]);
  console.log(`   ✅ Created ${sessions.length} focus sessions`);

  // Summary
  const doneTasks = tasks.filter((t: any) => t.status === 'done').length;
  const inProgressTasks = tasks.filter((t: any) => t.status === 'in_progress').length;
  const todoTasks = tasks.filter((t: any) => t.status === 'todo').length;
  const totalFocusMinutes = sessions.reduce((sum: number, s: any) => sum + (s.duration || 0), 0);

  console.log('\n🎉 Seed complete! Summary:');
  console.log(`   👤 Demo account: demo@focusdev.com / password123`);
  console.log(`   📋 Tasks: ${doneTasks} done, ${inProgressTasks} in progress, ${todoTasks} todo`);
  console.log(`   ⏱️  Focus time: ${Math.floor(totalFocusMinutes / 60)}h ${totalFocusMinutes % 60}m across ${sessions.length} sessions`);

  await mongoose.disconnect();
  console.log('\n✅ Database connection closed.');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
