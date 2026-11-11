<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ImportRequest;
use App\Services\VaultTransfer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class VaultTransferController extends Controller
{
    public function __construct(private VaultTransfer $transfer)
    {
    }

    public function import(ImportRequest $request): JsonResponse
    {
        $result = $this->transfer->import($request->user(), $request->validated('rows'));

        return response()->json(['data' => $result], 201);
    }

    public function export(Request $request): StreamedResponse
    {
        $user = $request->user();

        return response()->streamDownload(function () use ($user) {
            $stream = fopen('php://output', 'w');
            $this->transfer->exportCsv($user, $stream);
            fclose($stream);
        }, 'password_vault_export.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Cache-Control' => 'no-store',
        ]);
    }
}
