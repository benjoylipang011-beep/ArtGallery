<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Artwork extends Model
{
    protected $fillable = [
        'title', 'artist', 'description', 'medium',
        'year', 'dimensions', 'price', 'category',
        'status', 'image',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'year'  => 'integer',
    ];

    public function savedByUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'saved_artworks')->withTimestamps();
    }
}