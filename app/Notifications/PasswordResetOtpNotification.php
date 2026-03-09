<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PasswordResetOtpNotification extends Notification
{
    use Queueable;

    public function __construct(
        public readonly string $otp
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Your Password Reset Code — benchGallery')
            ->greeting('Hello!')
            ->line('You requested a password reset for your benchGallery account.')
            ->line('Enter this 6-digit code in the app:')
            ->line(' ')
            ->line('**' . implode(' ', str_split($this->otp)) . '**')
            ->line(' ')
            ->line('This code expires in **10 minutes**.')
            ->line('If you did not request a password reset, no further action is required.')
            ->salutation('Regards, benchGallery');
    }
}