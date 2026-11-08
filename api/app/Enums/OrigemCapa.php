<?php

namespace App\Enums;

enum OrigemCapa: string
{
    case BrasilApi = 'brasilapi';
    case OpenLibrary = 'openlibrary';
    case Google = 'google';
    case Upload = 'upload';
}
