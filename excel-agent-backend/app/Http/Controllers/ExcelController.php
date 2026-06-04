<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ExcelController extends Controller
{
    protected string $difyApiUrl;

    public function __construct()
    {
        $this->difyApiUrl = config('services.dify.url', env('DIFY_API_URL', ''));
        Log::info('ExcelController: initialized', [
            'dify_configured' => !empty($this->difyApiUrl),
        ]);
    }

    protected function callDify(array $inputs, string $apiKey, string $conversationId = ''): array
    {
        $workflow = $inputs['prompt'] ?? 'unknown';
        Log::info('Excel: callDify start', [
            'workflow' => mb_substr($workflow, 0, 80),
            'has_api_key' => !empty($apiKey),
            'has_conversation' => !empty($conversationId),
        ]);

        if (!$this->difyApiUrl || !$apiKey) {
            Log::warning('Excel: Dify not configured');
            return ['reply' => 'Dify is not configured. Please set DIFY_API_URL and the required API key.', 'source' => 'fallback'];
        }

        $cacheKey = 'dify_excel_' . md5(json_encode($inputs) . $apiKey . $conversationId);

        try {
            $data = Cache::store('file')->remember($cacheKey, 3600, function () use ($inputs, $apiKey, $conversationId) {
                $payload = [
                    'inputs' => $inputs,
                    'response_mode' => 'blocking',
                    'user' => 'excel-agent',
                ];
                if ($conversationId) {
                    $payload['conversation_id'] = $conversationId;
                }

                $response = Http::timeout(60)->withHeaders([
                    'Authorization' => 'Bearer ' . $apiKey,
                    'Content-Type' => 'application/json',
                ])->post($this->difyApiUrl, $payload);

                $response->throw();
                return $response->json();
            });

            $outputs = $data['data'] ?? $data;
            $reply = $outputs['outputs']['text']
                ?? $outputs['outputs']['reply']
                ?? $outputs['outputs']['output']
                ?? $outputs['outputs']['result']
                ?? $outputs['answer']
                ?? (is_array($outputs['outputs'] ?? null) ? reset($outputs['outputs']) : null)
                ?? 'No output generated.';

            $reply = preg_replace('/<think>[\s\S]*?<\/think>/', '', $reply);
            $reply = trim($reply);

            Log::info('Excel: Dify response processed', [
                'workflow' => $workflow,
                'reply_length' => mb_strlen($reply),
                'conversation_id' => $data['conversation_id'] ?? null,
            ]);

            return [
                'reply' => $reply,
                'source' => 'dify',
                'conversation_id' => $data['conversation_id'] ?? null,
            ];
        } catch (\Exception $e) {
            Log::error('ExcelAgent Dify API call failed', [
                'error' => $e->getMessage(),
                'workflow' => $inputs['prompt'] ?? 'unknown',
            ]);
            return [
                'reply' => 'Error: ' . $e->getMessage(),
                'source' => 'error',
            ];
        }
    }

    public function generate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'prompt' => 'required|string',
            'rows' => 'nullable|integer|min:1|max:100',
            'format_type' => 'nullable|string|in:auto,table,financial,timeline,inventory,comparison',
            'conversation_id' => 'nullable|string',
        ]);

        Log::info('Excel: generate', [
            'prompt' => mb_substr($validated['prompt'], 0, 80),
            'rows' => $validated['rows'] ?? 10,
            'format_type' => $validated['format_type'] ?? 'auto',
        ]);

        $result = $this->callDify([
            'prompt' => $validated['prompt'],
            'rows' => $validated['rows'] ?? 10,
            'format_type' => $validated['format_type'] ?? 'auto',
        ], config('services.dify.key_excel_agent', env('DIFY_APP_KEY_EXCEL_AGENT', '')), $validated['conversation_id'] ?? '');

        Log::info('Excel: generate done', ['source' => $result['source'] ?? 'unknown']);
        return response()->json($result);
    }

    public function refine(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'prompt' => 'required|string',
            'current_data' => 'required|string',
            'conversation_id' => 'nullable|string',
        ]);

        Log::info('Excel: refine', [
            'prompt' => mb_substr($validated['prompt'], 0, 80),
            'data_length' => mb_strlen($validated['current_data']),
        ]);

        $result = $this->callDify([
            'prompt' => $validated['prompt'],
            'current_data' => $validated['current_data'],
        ], config('services.dify.key_excel_refiner', env('DIFY_APP_KEY_EXCEL_REFINER', '')), $validated['conversation_id'] ?? '');

        Log::info('Excel: refine done', ['source' => $result['source'] ?? 'unknown']);
        return response()->json($result);
    }

    public function research(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'prompt' => 'required|string',
            'columns' => 'required|string',
            'row_count' => 'nullable|integer|min:1|max:50',
            'conversation_id' => 'nullable|string',
        ]);

        Log::info('Excel: research', [
            'prompt' => mb_substr($validated['prompt'], 0, 80),
            'row_count' => $validated['row_count'] ?? 10,
        ]);

        $result = $this->callDify([
            'prompt' => $validated['prompt'],
            'columns' => $validated['columns'],
            'row_count' => $validated['row_count'] ?? 10,
        ], config('services.dify.key_excel_web_research', env('DIFY_APP_KEY_EXCEL_WEB_RESEARCH', '')), $validated['conversation_id'] ?? '');

        Log::info('Excel: research done', ['source' => $result['source'] ?? 'unknown']);
        return response()->json($result);
    }
}
