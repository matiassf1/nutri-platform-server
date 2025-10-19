# Messaging Module - NutriTeam Email Templates

This module provides a comprehensive email system for the NutriTeam nutrition platform, featuring professional email templates with NutriTeam branding and support for multiple email types.

## 🎨 Design System

The email templates follow NutriTeam's design system:

- **Primary Color**: #4CAF50 (Health Green)
- **Accent Color**: #66BB6A (Light Green)
- **Background**: #F9FAFB (Light Gray)
- **Text Colors**:
  - Primary: #1F2937 (Dark Gray)
  - Secondary: #374151 (Medium Gray)
  - Muted: #6B7280 (Light Gray)
- **Font**: Inter (Google Fonts)
- **Border Radius**: 12px (Rounded corners)
- **Shadows**: Soft, natural shadows

## 📧 Available Email Templates

### 1. Welcome Email (`welcome`)

- **Purpose**: Sent when users register
- **Features**:
  - NutriTeam branding
  - Feature highlights
  - Call-to-action button
  - Professional welcome message

### 2. Password Reset (`password-reset`)

- **Purpose**: Sent when users request password reset
- **Features**:
  - Security warning
  - Time-limited reset link
  - Clear instructions
  - Safety information

### 3. Patient Invitation (`patient-invitation`)

- **Purpose**: Sent when nutritionists invite patients
- **Features**:
  - Personal message from nutritionist
  - Platform benefits
  - Invitation acceptance button
  - Professional introduction

### 4. Plan Update (`plan-update`)

- **Purpose**: Sent when nutrition plans are updated
- **Features**:
  - Change summary
  - Nutritionist information
  - Plan details
  - View updated plan button

### 5. Appointment Reminder (`appointment-reminder`)

- **Purpose**: Sent as appointment reminders
- **Features**:
  - Date and time details
  - Nutritionist information
  - Appointment type
  - Reschedule information

### 6. Recipe Recommendation (`recipe-recommendation`)

- **Purpose**: Sent when nutritionists recommend recipes
- **Features**:
  - Recipe details
  - Nutritional information
  - Cook time
  - Direct recipe link

## 🛠️ Usage

### Basic Usage

```typescript
import { EmailService } from './messaging/services/email.service';

// Inject the service
constructor(private readonly emailService: EmailService) {}

// Send welcome email
await this.emailService.sendWelcomeEmail(
  'user@example.com',
  'John Doe',
  'https://nutriteam.com/dashboard'
);

// Send password reset
await this.emailService.sendPasswordResetEmail(
  'user@example.com',
  'John Doe',
  'https://nutriteam.com/reset?token=abc123',
  '24 horas'
);

// Send patient invitation
await this.emailService.sendPatientInvitationEmail(
  'patient@example.com',
  'Jane Smith',
  'Dr. Maria Rodriguez',
  'https://nutriteam.com/register?invitation=true',
  '¡Hola! Me gustaría trabajar contigo en tu plan nutricional.'
);
```

### Advanced Usage

```typescript
// Send custom template email
await this.emailService.sendTemplateEmail(
  "welcome",
  "user@example.com",
  "Custom Subject",
  {
    userName: "John Doe",
    userEmail: "user@example.com",
    customMessage: "Welcome to our platform!",
    actionUrl: "https://nutriteam.com/start",
  }
);

// Send with attachments
await this.emailService.sendEmail({
  to: "user@example.com",
  subject: "Document Attached",
  templateName: "base-email",
  templateData: {
    userName: "John Doe",
    title: "Your Documents",
    message: "Please find attached your nutrition plan.",
  },
  attachments: [
    {
      filename: "nutrition-plan.pdf",
      content: pdfBuffer,
      contentType: "application/pdf",
    },
  ],
});
```

## 🎯 Template Structure

### MJML Templates

Located in `email-templates/mjml/`:

- `base-email.mjml` - Base template with NutriTeam branding
- `welcome.mjml` - Welcome email template
- `password-reset.mjml` - Password reset template
- `patient-invitation.mjml` - Patient invitation template
- `plan-update.mjml` - Plan update template

### Compiled Templates

Located in `email-templates/compiled/`:

- Handlebars (.hbs) templates for server-side rendering
- Pre-compiled for better performance
- Include NutriTeam styling and branding

### Partials

Located in `email-templates/partials/`:

- `header.mjml` - Reusable header component
- `footer.mjml` - Reusable footer component

## 🔧 Configuration

### Environment Variables

```env
# Email Configuration
NODEMAILER_HOST=smtp.gmail.com
NODEMAILER_PORT=587
NODEMAILER_ENCRYPTION=tls
NODEMAILER_AUTH_USER=your-email@gmail.com
NODEMAILER_AUTH_PASS=your-app-password
NODEMAILER_SENDER_NAME=NutriTeam
NODEMAILER_SENDER_MAIL=noreply@nutriteam.com

# Frontend URLs
FRONTEND_URL=https://nutriteam.com
```

### Module Registration

```typescript
// In your app.module.ts
import { MessagingModule } from "./messaging/messaging.module";

@Module({
  imports: [
    MessagingModule,
    // ... other modules
  ],
})
export class AppModule {}
```

## 📱 Responsive Design

All email templates are fully responsive and optimized for:

- Desktop email clients (Outlook, Apple Mail, Thunderbird)
- Mobile email clients (Gmail, Yahoo Mail, Apple Mail)
- Web-based email clients (Gmail Web, Outlook Web)

## 🎨 Customization

### Adding New Templates

1. Create MJML template in `email-templates/mjml/`
2. Compile to Handlebars in `email-templates/compiled/`
3. Add template method in `EmailTemplateService`
4. Add service method in `EmailService`

### Modifying Existing Templates

1. Edit MJML template in `email-templates/mjml/`
2. Recompile to Handlebars
3. Update template data interfaces if needed

## 🧪 Testing

### Test Email Service

```typescript
// Test connection
const isConnected = await this.emailService.testConnection();

// Test specific template
await this.emailService.sendWelcomeEmail(
  "test@example.com",
  "Test User",
  "https://nutriteam.com/test"
);
```

### Available Test Endpoints

- `POST /notifications/test-email` - Send test email
- `GET /notifications/templates` - List available templates

## 📊 Monitoring

The email service includes comprehensive logging:

- Email send attempts
- Success/failure rates
- Error details
- Template rendering issues

## 🔒 Security

- All email content is sanitized
- No user data is logged in plain text
- Secure SMTP connections
- Rate limiting support

## 🚀 Performance

- Template caching for faster rendering
- Async email sending
- Error handling and retry logic
- Connection pooling

## 📝 Best Practices

1. **Always use templates** - Don't send raw HTML
2. **Test before sending** - Use test endpoints
3. **Handle errors gracefully** - Check return status
4. **Use appropriate templates** - Match email purpose
5. **Include fallback content** - Plain text versions
6. **Monitor delivery rates** - Track success/failure

## 🔮 Future Enhancements

- [ ] A/B testing for email content
- [ ] Advanced analytics and tracking
- [ ] Multi-language support
- [ ] Email scheduling
- [ ] Advanced personalization
- [ ] Template management UI
- [ ] Email automation workflows
