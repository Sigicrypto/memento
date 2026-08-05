export const EmailTemplates = {
  welcome: (name: string) => ({
    subject: 'Welcome to Memento! Let\'s create magic.',
    html: `
      <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto;">
        <h2>Welcome to Memento, ${name}!</h2>
        <p>We're thrilled to have you on board. With Memento, you can collect every memory from your events instantly.</p>
        <p>Ready to get started?</p>
        <a href="https://mymementoapp.com/create" style="display: inline-block; padding: 12px 24px; background-color: #f43f5e; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Create Your First Wall</a>
      </div>
    `
  }),
  
  wallCreated: (eventName: string, link: string) => ({
    subject: `Your wall for ${eventName} is ready!`,
    html: `
      <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto;">
        <h2>Your Memento Wall is Live!</h2>
        <p>Your photo wall for <strong>${eventName}</strong> has been successfully created.</p>
        <p>Share this link with your guests so they can start uploading photos:</p>
        <p><a href="${link}" style="font-size: 18px; color: #3b82f6;">${link}</a></p>
        <p>You can also download your QR code from your dashboard.</p>
      </div>
    `
  }),

  uploadNotification: (eventName: string, count: number, link: string) => ({
    subject: `📸 ${count} new photos uploaded to ${eventName}`,
    html: `
      <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto;">
        <h2>New Memories Added!</h2>
        <p>Your guests have uploaded <strong>${count}</strong> new photos to your wall for ${eventName}.</p>
        <a href="${link}" style="display: inline-block; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">View New Photos</a>
      </div>
    `
  }),

  eventSummary: (eventName: string, totalPhotos: number, downloadLink: string) => ({
    subject: `Your ${eventName} Recap - Download your memories!`,
    html: `
      <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto;">
        <h2>What a great event!</h2>
        <p>Your guests captured <strong>${totalPhotos}</strong> beautiful memories at ${eventName}.</p>
        <p>You can download a high-quality ZIP archive of all photos using the link below:</p>
        <a href="${downloadLink}" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Download All Photos</a>
      </div>
    `
  })
};
