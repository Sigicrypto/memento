# 🚀 Production Deployment Guide

## 🔐 Admin Security Setup

### 1. Environment Variables

Set these in your deployment platform:

```bash
# Admin Access Code (CHANGE THIS!)
NEXT_PUBLIC_ADMIN_ACCESS_CODE=your-secret-admin-code-2024
ADMIN_ACCESS_CODE=your-secret-admin-code-2024

# Supabase Service Role Key (Required for Admin Plan & User Upgrades)
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Optional: IP Whitelisting
ALLOWED_ADMIN_IPS=your-office-ip,your-home-ip

# Optional: Admin JWT Secret
ADMIN_SECRET_KEY=your-super-secret-jwt-key
```

### 2. Deployment Platforms

#### Vercel
```bash
# Set environment variables
vercel env add NEXT_PUBLIC_ADMIN_ACCESS_CODE
vercel env add ADMIN_ACCESS_CODE
vercel env add ALLOWED_ADMIN_IPS

# Deploy
vercel --prod
```

#### Netlify
```bash
# Set environment variables
netlify env:set NEXT_PUBLIC_ADMIN_ACCESS_CODE "your-code"
netlify env:set ADMIN_ACCESS_CODE "your-code"

# Deploy
netlify deploy --prod
```

#### Railway
```bash
# Set environment variables
railway variables set NEXT_PUBLIC_ADMIN_ACCESS_CODE=your-code
railway variables set ADMIN_ACCESS_CODE=your-code

# Deploy
railway deploy
```

### 3. Security Checklist

- [ ] Change default admin code
- [ ] Set up IP whitelisting
- [ ] Enable monitoring
- [ ] Test admin access
- [ ] Verify regular users can't access admin

## 🎯 Admin URLs

### Development
- Admin Login: `http://localhost:3000/system`
- Admin Dashboard: `http://localhost:3000/admin`

### Production
- Admin Login: `https://yourdomain.com/system`
- Admin Dashboard: `https://yourdomain.com/admin`

## 🛡️ Security Features

1. **Hidden Admin URL**: `/system` (not in navigation)
2. **Environment Variable Protection**: Admin code stored securely
3. **Automatic Admin Role**: Users get admin role on first login
4. **Middleware Protection**: Additional layer of security
5. **IP Whitelisting**: Optional IP-based access control
6. **Access Logging**: Monitors unauthorized attempts

## 📝 Admin Credentials

For production, use:
- **Email**: `admin@yourdomain.com`
- **Access Code**: Your environment variable value

## 🔧 Advanced Security (Optional)

### IP Whitelisting
```bash
# Enable in middleware.ts
return new NextResponse('Access Denied', { status: 403 });
```

### Rate Limiting
Add to your deployment platform or use a service like Cloudflare.

### 2FA
Integrate with Supabase Auth or external service.

## 🚨 Important Notes

1. **Never commit admin credentials to Git**
2. **Use strong, unique admin codes**
3. **Regularly rotate admin credentials**
4. **Monitor admin access logs**
5. **Keep dependencies updated**

## 🆘 Support

If you need help:
1. Check environment variables are set correctly
2. Verify admin code matches exactly
3. Ensure Supabase auth is configured
4. Check deployment logs for errors
