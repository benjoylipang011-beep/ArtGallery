import { useState } from 'react';
import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store as loginStore } from '@/routes/login';
import { store as registerStore } from '@/routes/register';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function CombinedAuth({
    status,
    canResetPassword,
    canRegister,
}: Props) {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <>
            <Head title={isLogin ? 'Log in' : 'Register'} />
            <div className="relative min-h-dvh bg-gradient-to-r from-green-500 via-lime-400 to-yellow-500">
                <div className="flex min-h-dvh items-center justify-center px-4 py-8">
                    <div className="w-full max-w-md">
                        {/* Main Centered Card */}
                        <div className="overflow-hidden rounded-3xl bg-white shadow-2xl">
                            <div className="px-8 py-12 sm:px-12">
                                {/* Login Form */}
                                <div
                                    className={`space-y-6 transition-all duration-700 ${
                                        isLogin
                                            ? 'pointer-events-auto opacity-100'
                                            : 'pointer-events-none opacity-0'
                                    }`}
                                >
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-bold text-gray-900">
                                            Welcome Back
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            Enter your credentials to sign in
                                        </p>
                                    </div>

                                    <Form
                                        {...loginStore.form()}
                                        resetOnSuccess={['password']}
                                        className="space-y-4"
                                    >
                                        {({ processing, errors }) => (
                                            <>
                                                <div className="space-y-3">
                                                    <div>
                                                        <Input
                                                            id="login-email"
                                                            type="email"
                                                            name="email"
                                                            required
                                                            autoFocus
                                                            autoComplete="email"
                                                            placeholder="Email"
                                                            className="h-12 rounded-lg border-gray-400 bg-gray-300 px-4 placeholder:text-gray-600"
                                                        />
                                                        <InputError
                                                            message={
                                                                errors.email
                                                            }
                                                            className="mt-1 text-xs"
                                                        />
                                                    </div>

                                                    <div>
                                                        <Input
                                                            id="login-password"
                                                            type="password"
                                                            name="password"
                                                            required
                                                            autoComplete="current-password"
                                                            placeholder="Password"
                                                            className="h-12 rounded-lg border-gray-400 bg-gray-300 px-4 placeholder:text-gray-600"
                                                        />
                                                        <InputError
                                                            message={
                                                                errors.password
                                                            }
                                                            className="mt-1 text-xs"
                                                        />
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <label className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id="remember"
                                                                name="remember"
                                                            />
                                                            <span className="text-xs font-medium text-gray-700">
                                                                Remember me
                                                            </span>
                                                        </label>
                                                        {canResetPassword && (
                                                            <TextLink
                                                                href={
                                                                    request()
                                                                }
                                                                className="text-xs text-blue-600 hover:underline"
                                                            >
                                                                Forgot password?
                                                            </TextLink>
                                                        )}
                                                    </div>
                                                </div>

                                                <Button
                                                    type="submit"
                                                    className="h-12 w-full rounded-lg bg-yellow-500 font-bold text-gray-900 hover:bg-yellow-600"
                                                    disabled={processing}
                                                >
                                                    {processing && (
                                                        <Spinner />
                                                    )}
                                                    SIGN IN
                                                </Button>

                                                {canRegister && (
                                                    <div className="text-center">
                                                        <p className="text-sm text-gray-600">
                                                            Don't have an account?{' '}
                                                            <button
                                                                onClick={() =>
                                                                    setIsLogin(
                                                                        false
                                                                    )
                                                                }
                                                                className="font-semibold text-blue-600 hover:underline"
                                                            >
                                                                Sign up
                                                            </button>
                                                        </p>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </Form>
                                </div>

                                {/* Register Form */}
                                {canRegister && (
                                    <div
                                        className={`space-y-6 transition-all duration-700 ${
                                            !isLogin
                                                ? 'pointer-events-auto opacity-100'
                                                : 'pointer-events-none opacity-0'
                                        }`}
                                    >
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-bold text-gray-900">
                                                Register With
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                Fill Out The Following Info For
                                                Registration
                                            </p>
                                        </div>

                                        {/* Social Auth Buttons */}
                                        <div className="flex justify-center gap-3">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-11 w-11 border-0 rounded-lg bg-black p-0 text-white hover:bg-gray-900"
                                                title="Google"
                                            >
                                                G
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-11 w-11 border-0 rounded-lg bg-black p-0 text-white hover:bg-gray-900"
                                                title="Facebook"
                                            >
                                                <svg
                                                    viewBox="0 0 24 24"
                                                    className="h-5 w-5"
                                                    fill="currentColor"
                                                >
                                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                                </svg>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-11 w-11 border-0 rounded-lg bg-black p-0 text-white hover:bg-gray-900"
                                                title="GitHub"
                                            >
                                                <svg
                                                    viewBox="0 0 24 24"
                                                    className="h-5 w-5"
                                                    fill="currentColor"
                                                >
                                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                                </svg>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-11 w-11 border-0 rounded-lg bg-black p-0 text-white hover:bg-gray-900"
                                                title="LinkedIn"
                                            >
                                                <svg
                                                    viewBox="0 0 24 24"
                                                    className="h-5 w-5"
                                                    fill="currentColor"
                                                >
                                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.475-2.236-1.986-2.236-1.081 0-1.722.722-2.004 1.418-.103.249-.129.597-.129.946v5.441h-3.554s.047-8.733 0-9.637h3.554v1.366c.43-.664 1.199-1.608 2.928-1.608 2.136 0 3.745 1.393 3.745 4.385v5.494zM5.337 9.433c-1.144 0-1.915-.759-1.915-1.71 0-.951.767-1.71 1.906-1.71.948 0 1.915.759 1.915 1.71 0 .951-.767 1.71-1.906 1.71zm1.547 11.019H3.73V9.814h3.154v10.638zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                                </svg>
                                            </Button>
                                        </div>

                                        {/* Divider */}
                                        <div className="relative">
                                            <div className="absolute inset-0 flex items-center">
                                                <div className="w-full border-t border-gray-300" />
                                            </div>
                                            <div className="relative flex justify-center text-sm">
                                                <span className="bg-white px-3 font-medium text-gray-600">
                                                    OR
                                                </span>
                                            </div>
                                        </div>

                                        <Form
                                            {...registerStore.form()}
                                            resetOnSuccess={[
                                                'password',
                                                'password_confirmation',
                                            ]}
                                            className="space-y-3"
                                        >
                                            {({ processing, errors }) => (
                                                <>
                                                    <div className="space-y-3">
                                                        <div>
                                                            <Input
                                                                id="register-name"
                                                                type="text"
                                                                name="name"
                                                                required
                                                                autoFocus
                                                                autoComplete="name"
                                                                placeholder="Name"
                                                                className="h-11 rounded-lg border-gray-400 bg-gray-300 px-4 placeholder:text-gray-600"
                                                            />
                                                            <InputError
                                                                message={
                                                                    errors.name
                                                                }
                                                                className="mt-1 text-xs"
                                                            />
                                                        </div>

                                                        <div>
                                                            <Input
                                                                id="register-email"
                                                                type="email"
                                                                name="email"
                                                                required
                                                                autoComplete="email"
                                                                placeholder="Email"
                                                                className="h-11 rounded-lg border-gray-400 bg-gray-300 px-4 placeholder:text-gray-600"
                                                            />
                                                            <InputError
                                                                message={
                                                                    errors.email
                                                                }
                                                                className="mt-1 text-xs"
                                                            />
                                                        </div>

                                                        <div>
                                                            <Input
                                                                id="register-password"
                                                                type="password"
                                                                name="password"
                                                                required
                                                                autoComplete="new-password"
                                                                placeholder="Password"
                                                                className="h-11 rounded-lg border-gray-400 bg-gray-300 px-4 placeholder:text-gray-600"
                                                            />
                                                            <InputError
                                                                message={
                                                                    errors.password
                                                                }
                                                                className="mt-1 text-xs"
                                                            />
                                                        </div>

                                                        <div>
                                                            <Input
                                                                id="register-password-confirm"
                                                                type="password"
                                                                name="password_confirmation"
                                                                required
                                                                autoComplete="new-password"
                                                                placeholder="Confirm Password"
                                                                className="h-11 rounded-lg border-gray-400 bg-gray-300 px-4 placeholder:text-gray-600"
                                                            />
                                                            <InputError
                                                                message={
                                                                    errors.password_confirmation
                                                                }
                                                                className="mt-1 text-xs"
                                                            />
                                                        </div>
                                                    </div>

                                                    <Button
                                                        type="submit"
                                                        className="h-11 w-full rounded-lg bg-yellow-500 font-bold text-gray-900 hover:bg-yellow-600"
                                                        disabled={processing}
                                                    >
                                                        {processing && (
                                                            <Spinner />
                                                        )}
                                                        SIGN UP
                                                    </Button>

                                                    <div className="text-center">
                                                        <p className="text-sm text-gray-600">
                                                            Already have an
                                                            account?{' '}
                                                            <button
                                                                onClick={() =>
                                                                    setIsLogin(
                                                                        true
                                                                    )
                                                                }
                                                                className="font-semibold text-blue-600 hover:underline"
                                                            >
                                                                Sign in
                                                            </button>
                                                        </p>
                                                    </div>
                                                </>
                                            )}
                                        </Form>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
