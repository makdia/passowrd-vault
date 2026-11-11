<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ItemFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => ucfirst($this->faker->domainWord()),
            'username' => $this->faker->userName(),
            'password' => $this->faker->password(14, 20),
            'url' => $this->faker->url(),
            'notes' => null,
            'status' => 1,
        ];
    }
}
