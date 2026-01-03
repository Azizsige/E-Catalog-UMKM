<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, $role): Response
    {
        // Cek apakah user punya role sesuai yg diminta
        if ($request->user()->role !== $role) {
            // Kalau role-nya beda, tendang ke halaman depan
            return redirect('/');
        }

        return $next($request);
    }
}
