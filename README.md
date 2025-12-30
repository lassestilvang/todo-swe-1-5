# Next.js Daily Task Planner

A modern, feature-rich daily task planner web application built with Next.js 16, TypeScript, and Tailwind CSS. This application provides intelligent task management with natural language processing, smart suggestions, file attachments, and comprehensive productivity insights.

## 🚀 Features

### Core Task Management
- ✅ Create, edit, and delete tasks
- ✅ Task priorities (High, Medium, Low, None)
- ✅ Task scheduling with dates and deadlines
- ✅ Time tracking (estimates and actual time)
- ✅ Task descriptions and notes
- ✅ Subtask management
- ✅ Task completion tracking
- ✅ Activity logging

### Advanced Features
- 🧠 **Natural Language Processing**: Create tasks using natural language like "Meeting tomorrow at 2 PM #work urgent"
- 📎 **File Attachments**: Upload and manage files with drag-and-drop support
- 📊 **Smart Suggestions**: AI-powered recommendations for scheduling and productivity
- 🔄 **Recurring Tasks**: Set up daily, weekly, monthly, or custom recurring patterns
- 🏷️ **Labels & Lists**: Organize tasks with custom labels and lists
- 🔍 **Advanced Search**: Fuzzy search across all task fields
- 📈 **Productivity Insights**: Track completion rates and workload analytics

### User Interface
- 🎨 Modern, clean design with Tailwind CSS
- 🌙 Dark/light theme support
- 📱 Fully responsive design
- ⚡ Smooth animations with Framer Motion
- ♿ Accessibility-focused design

## 🛠️ Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript with strict type checking
- **Package Manager**: Bun
- **Styling**: Tailwind CSS with shadcn/ui components
- **Animations**: Framer Motion
- **Database**: SQLite with Drizzle ORM
- **Forms**: React Hook Form with Zod validation
- **Date Handling**: date-fns library
- **Icons**: Lucide React
- **Testing**: Bun Test with React Testing Library

## 📦 Installation

### Prerequisites
- Node.js 18+ or Bun runtime
- Git

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd todo-swe-1-5
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up the database**
   ```bash
   bun run db:generate
   bun run db:migrate
   ```

4. **Run the development server**
   ```bash
   bun run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui base components
│   ├── TaskCard.tsx      # Task display component
│   ├── TaskForm.tsx      # Task creation/editing form
│   ├── NaturalLanguageTaskInput.tsx  # NLP task input
│   ├── AttachmentManager.tsx        # File upload/management
│   ├── SmartSuggestions.tsx          # AI-powered suggestions
│   └── ...
├── contexts/              # React Context providers
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
│   ├── db/              # Database schema and operations
│   ├── nlp-parser.ts    # Natural language processing
│   ├── smart-suggestions.ts  # AI recommendations
│   └── ...
├── __tests__/            # Test files
└── types/                # TypeScript type definitions
```

## 🧪 Testing

### Running Tests
```bash
# Run all tests
bun test

# Run tests with coverage
bun run test:coverage

# Run specific test file
bun test src/__tests__/components.test.tsx
```

### Test Coverage
- Unit tests for database operations
- Component tests for UI components
- Integration tests for user workflows
- Natural language processing tests
- Smart suggestions algorithm tests

## 📚 Usage Guide

### Creating Tasks

#### Standard Form
1. Click the "New Task" button
2. Fill in task details (name, description, priority, etc.)
3. Set date, time, and estimates if needed
4. Add labels and attachments
5. Save the task

#### Natural Language Input
Use the quick input field to create tasks with natural language:
- `Meeting tomorrow at 2 PM #work urgent`
- `Review project proposal #work 2h`
- `Call dentist Monday 10 AM #personal`
- `Weekly team meeting every Tuesday 3 PM #work recurring`

### Managing Tasks

#### Task Organization
- **Lists**: Create custom lists to organize tasks (e.g., Work, Personal, Projects)
- **Labels**: Add multiple labels to tasks for categorization
- **Priority**: Set priority levels to focus on important tasks
- **Dates**: Schedule tasks for specific dates or set deadlines

#### Time Tracking
- Add time estimates when creating tasks
- Track actual time spent on tasks
- View productivity insights based on time data

#### Attachments
- Upload files directly to tasks
- Supported formats: Images, PDFs, Documents, Spreadsheets
- Drag and drop files for quick uploads
- Preview images and download attachments

### Views and Filtering

#### Available Views
- **Today**: Tasks scheduled for today
- **Next 7 Days**: Tasks for the upcoming week
- **Upcoming**: All future tasks
- **All**: Complete task overview

#### Filtering Options
- Filter by completion status
- Filter by priority level
- Filter by lists and labels
- Filter by date ranges
- Search tasks with fuzzy matching

### Smart Features

#### Natural Language Processing
The NLP parser understands:
- **Dates**: "tomorrow", "Monday", "next week", "2024-12-25"
- **Times**: "2 PM", "14:30", "noon", "morning"
- **Priority**: "urgent", "important", "high priority", "low priority"
- **Labels**: "#work", "#personal", "#urgent"
- **Estimates**: "2h", "30m", "1h 30m"
- **Recurring**: "daily", "weekly", "every 2 weeks"

#### Smart Suggestions
The app provides intelligent recommendations:
- **Scheduling**: Suggest optimal times for unscheduled tasks
- **Priority**: Recommend priority adjustments
- **Workload**: Alert when workload is too heavy
- **Productivity**: Insights about completion patterns
- **Work-life Balance**: Reminders for maintaining balance

#### Productivity Insights
Track your productivity with:
- Task completion rates
- On-time completion percentages
- Average tasks per day
- Workload analysis
- Time tracking analytics

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file for environment-specific settings:

```env
# Database
DATABASE_URL="file:./todo-app.db"

# File Upload
MAX_FILE_SIZE=10485760  # 10MB in bytes
UPLOAD_DIR=./public/uploads

# App Settings
DEFAULT_THEME=light
DEFAULT_VIEW=all
```

### Database Schema
The application uses SQLite with the following main tables:
- `tasks` - Task records
- `lists` - Task lists/categories
- `labels` - Task labels/tags
- `attachments` - File attachments
- `subtasks` - Task subtasks
- `activity_log` - Change tracking

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
# Build for production
bun run build

# Start production server
bun run start
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --production
COPY . .
RUN bun run build
EXPOSE 3000
CMD ["bun", "start"]
```

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `bun test`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Style
- Use TypeScript for all new code
- Follow existing component patterns
- Add tests for new features
- Update documentation as needed
- Use conventional commit messages

### Bug Reports
- Use the GitHub Issues tracker
- Include steps to reproduce
- Add screenshots if applicable
- Specify browser and OS information

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Drizzle ORM](https://orm.drizzle.team/) - Database ORM
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [Lucide](https://lucide.dev/) - Icon library
- [date-fns](https://date-fns.org/) - Date utilities

## 📞 Support

For support, questions, or feature requests:
- Create an issue on GitHub
- Check the [FAQ](docs/FAQ.md)
- Review the [API documentation](docs/API.md)

---

**Built with ❤️ using Next.js and TypeScript**
