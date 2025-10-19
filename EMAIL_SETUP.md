# Email Service Setup with Nodemailer

This document explains how to configure and use the Nodemailer email service in the ULTRAS nutrition platform backend.

## Configuration

### Environment Variables

Add the following environment variables to your `.env` file:

```env
# Email - Nodemailer Configuration
NODEMAILER_HOST=smtp.gmail.com
NODEMAILER_PORT=587
NODEMAILER_ENCRYPTION=tls
NODEMAILER_AUTH_USER=your-email@gmail.com
NODEMAILER_AUTH_PASS=your-app-password
NODEMAILER_SENDER_NAME=ULTRAS
NODEMAILER_SENDER_MAIL=noreply@ultras.com
```

### Gmail Setup

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password as `NODEMAILER_AUTH_PASS`

### Other Email Providers

You can use other SMTP providers by changing the configuration:

#### Outlook/Hotmail

```env
NODEMAILER_HOST=smtp-mail.outlook.com
NODEMAILER_PORT=587
NODEMAILER_ENCRYPTION=tls
```

#### Yahoo

```env
NODEMAILER_HOST=smtp.mail.yahoo.com
NODEMAILER_PORT=587
NODEMAILER_ENCRYPTION=tls
```

#### Custom SMTP

```env
NODEMAILER_HOST=your-smtp-server.com
NODEMAILER_PORT=587
NODEMAILER_ENCRYPTION=tls
```

## Features

### Email Templates

The email service includes pre-built templates for:

1. **Welcome Email** - Sent when users register
2. **Password Reset** - Sent when users request password reset
3. **Plan Update Notification** - Sent when nutrition plans are updated
4. **Patient Invitation** - Sent when nutritionists invite patients

### Usage Examples

#### Sending a Custom Email

```typescript
import { EmailService } from './common/services/email.service';

// Inject the service
constructor(private readonly emailService: EmailService) {}

// Send email
const result = await this.emailService.sendEmail({
  to: 'user@example.com',
  subject: 'Custom Subject',
  html: '<h1>Hello World</h1>',
  text: 'Hello World',
});
```

#### Using Pre-built Templates

```typescript
// Welcome email
await this.emailService.sendWelcomeEmail("user@example.com", "John Doe");

// Password reset
await this.emailService.sendPasswordResetEmail(
  "user@example.com",
  "reset-token-123"
);

// Plan update notification
await this.emailService.sendPlanUpdateNotification(
  "patient@example.com",
  "Weight Loss Plan"
);

// Patient invitation
await this.emailService.sendPatientInvitation(
  "patient@example.com",
  "Dr. Smith",
  "Welcome to my practice!"
);
```

## API Endpoints

### Authentication Endpoints

- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token

### Notification Endpoints

- `POST /notifications/send-email` - Send custom email

### Patient Management

- `POST /patients/:id/invite` - Send patient invitation

## Error Handling

The email service includes comprehensive error handling:

- Connection verification on startup
- Graceful failure handling
- Detailed logging for debugging
- Fallback responses for failed emails

## Security Considerations

1. **Environment Variables**: Never commit email credentials to version control
2. **App Passwords**: Use app-specific passwords, not your main account password
3. **Rate Limiting**: Consider implementing rate limiting for email endpoints
4. **Token Expiration**: Password reset tokens should have expiration times
5. **Email Validation**: Always validate email addresses before sending

## Testing

### Development Testing

For development, you can use services like:

- [Mailtrap](https://mailtrap.io/) - Email testing service
- [MailHog](https://github.com/mailhog/MailHog) - Local SMTP testing
- [Ethereal Email](https://ethereal.email/) - Fake SMTP service

### Production Testing

1. Test with a small group of users first
2. Monitor email delivery rates
3. Check spam folders
4. Verify email templates render correctly

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Verify app password is correct
   - Ensure 2FA is enabled
   - Check if "Less secure app access" is enabled (not recommended)

2. **Connection Timeout**
   - Check firewall settings
   - Verify SMTP server and port
   - Try different encryption settings

3. **Emails Not Received**
   - Check spam folder
   - Verify recipient email address
   - Check email provider's delivery logs

### Debug Mode

Enable debug logging by setting the log level to debug in your NestJS configuration.

## Monitoring

Consider implementing:

- Email delivery tracking
- Bounce rate monitoring
- Open rate analytics
- Error rate alerts

## Future Enhancements

- Email template management system
- A/B testing for email content
- Advanced analytics and reporting
- Multi-language support
- Email scheduling
- Attachment support
