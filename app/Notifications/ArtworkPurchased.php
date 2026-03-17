<?php

namespace App\Notifications;

use App\Models\Artwork;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ArtworkPurchased extends Notification
{
    use Queueable;

    public function __construct(
        public readonly User    $buyer,
        public readonly Artwork $artwork,
        public readonly int     $orderId,
    ) {}

    /** Store in the database only — no email, no admin. */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'type'       => 'artwork_sold',
            'message'    => "{$this->buyer->name} purchased your artwork \"{$this->artwork->title}\".",
            'buyer_name' => $this->buyer->name,
            'artwork'    => $this->artwork->title,
            'action_url' => "/products/{$this->artwork->id}",
        ];
    }
}