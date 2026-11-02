<?php

declare(strict_types=1);

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Http\Resources\AreaResource;
use App\Models\Area;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection as Anonimos;

class AreaController extends Controller
{
    public function index(): Anonimos
    {
        $areas = Area::query()
            ->orderBy('ordem')
            ->withCount('livros')
            ->with(['subareas' => fn ($q) => $q->withCount('livros')])
            ->get();

        return AreaResource::collection($areas);
    }
}
