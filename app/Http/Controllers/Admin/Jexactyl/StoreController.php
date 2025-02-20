<?php

namespace Jexactyl\Http\Controllers\Admin\Jexactyl;

use Illuminate\View\View;
use Illuminate\Http\RedirectResponse;
use Prologue\Alerts\AlertsMessageBag;
use Jexactyl\Http\Controllers\Controller;
use Jexactyl\Exceptions\Model\DataValidationException;
use Jexactyl\Exceptions\Repository\RecordNotFoundException;
use Jexactyl\Http\Requests\Admin\Jexactyl\StoreFormRequest;
use Jexactyl\Contracts\Repository\SettingsRepositoryInterface;

class StoreController extends Controller
{
    /**
     * StoreController constructor.
     */
    public function __construct(
        private AlertsMessageBag $alert,
        private SettingsRepositoryInterface $settings
    ) {
    }

    /**
     * Render the Jexactyl store settings interface.
     */
    public function index(): View
    {
        $prefix = 'jexactyl::store:';

        $currencies = [];
        foreach (config('store.currencies') as $key => $value) {
            $currencies[] = ['code' => $key, 'name' => $value];
        }

        return view('admin.jexactyl.store', [
            'enabled' => $this->settings->get($prefix . 'enabled', false),
            'paypal_enabled' => $this->settings->get($prefix . 'paypal:enabled', false),
            'stripe_enabled' => $this->settings->get($prefix . 'stripe:enabled', false),
            'selected_currency' => $this->settings->get($prefix . 'currency', 'USD'),
            'currencies' => $currencies,

            'earn_enabled' => $this->settings->get('jexactyl::earn:enabled', false),
            'earn_amount' => $this->settings->get('jexactyl::earn:amount', 1),

            'cpu' => $this->settings->get($prefix . 'cost:cpu', 100),
            'memory' => $this->settings->get($prefix . 'cost:memory', 50),
            'disk' => $this->settings->get($prefix . 'cost:disk', 25),
            'slot' => $this->settings->get($prefix . 'cost:slot', 250),
            'port' => $this->settings->get($prefix . 'cost:port', 20),
            'backup' => $this->settings->get($prefix . 'cost:backup', 20),
            'database' => $this->settings->get($prefix . 'cost:database', 20),

            'limit_cpu' => $this->settings->get($prefix . 'limit:cpu', 100),
            'limit_memory' => $this->settings->get($prefix . 'limit:memory', 4096),
            'limit_disk' => $this->settings->get($prefix . 'limit:disk', 10240),
            'limit_port' => $this->settings->get($prefix . 'limit:allocation_limit', 1),
            'limit_backup' => $this->settings->get($prefix . 'limit:backup_limit', 1),
            'limit_database' => $this->settings->get($prefix . 'limit:database_limit', 1),
        ]);
    }

    /**
     * Handle settings update.
     *
     * @throws DataValidationException
     * @throws RecordNotFoundException
     */
    public function update(StoreFormRequest $request): RedirectResponse
    {
        foreach ($request->normalize() as $key => $value) {
            $this->settings->set('jexactyl::' . $key, $value);
        }

        $this->alert->success('If you have enabled a payment gateway, please remember to configure them. <a href="https://docs.jexactyl.com">Documentation</a>')->flash();

        return redirect()->route('admin.jexactyl.store');
    }
}
