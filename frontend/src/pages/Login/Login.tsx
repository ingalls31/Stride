import { yupResolver } from '@hookform/resolvers/yup'
import { useContext } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useMutation } from 'react-query'
import { Link, useNavigate } from 'react-router-dom'
import { Input as AntInput, Button as AntButton, Divider } from 'antd'
import { Mail, Lock, LogIn } from 'lucide-react'
import AuthApi from '~/apis/authApi'
import { AppContext } from '~/Contexts/app.context'
import path from '~/constants/path'
import { errorResponse } from '~/types/utils.type'
import { LoginFormData, loginSchema } from '~/utils/rulesForm'
import { isAxiosErrorUnprocessableEntity } from '~/utils/utils'
import useScrollTop from '~/hooks/useScrollTop'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import Header from '~/components/Header'

const Login = () => {
  const { t } = useTranslation('login')
  useScrollTop()
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema)
  })
  const navigate = useNavigate()
  const { setIsAuthenticated, setProfile } = useContext(AppContext)

  const loginAccountMutation = useMutation({
    mutationFn: (data: LoginFormData) => AuthApi.login(data)
  })

  const onSubmit = handleSubmit((data) => {
    loginAccountMutation.mutate(data, {
      onSuccess: (data) => {
        setIsAuthenticated(true)
        navigate(path.profile)
      },
      onError: (error) => {
        if (isAxiosErrorUnprocessableEntity<errorResponse<LoginFormData>>(error)) {
          const formError = error.response?.data.data
          if (formError) {
            Object.keys(formError).forEach((key) => {
              setError(key as keyof LoginFormData, {
                message: formError[key as keyof LoginFormData],
                type: 'Server'
              })
            })
          }
        }
      }
    })
  })

  return (
    <>
      <Helmet>
        <title>{`${t('sign in')} | Stride`}</title>
        <meta name='description' content='Page login Stride' />
      </Helmet>
      <div className='min-h-screen bg-gray-50'>
        <Header />
        <div className='container mx-auto px-4'>
          <div className='flex min-h-[calc(100vh-85px)] items-center justify-center'>
            <div className='w-full max-w-2xl rounded-lg bg-white p-10 shadow-[0_0_15px_rgba(91,164,164,0.3)] border-2 border-[#5BA4A4]/30'>
              <div className='mb-10 flex items-center justify-center space-x-2'>
                <LogIn className='h-8 w-8 text-[#5BA4A4]' />
                <h1 className='text-3xl font-bold text-gray-800'>{t('sign in')}</h1>
              </div>

              <form onSubmit={onSubmit} className='space-y-8' noValidate>
                <div className='space-y-6'>
                  <div>
                    <Controller
                      name="email"
                      control={control}
                      render={({ field }) => (
                        <AntInput
                          {...field}
                          prefix={<Mail className='mr-2 h-5 w-5 text-gray-400' />}
                          size='large'
                          placeholder='Email'
                          status={errors.email ? 'error' : ''}
                          className='hover:border-[#5BA4A4] focus:border-[#5BA4A4] hover:shadow-[0_2px_8px_rgba(91,164,164,0.2)] transition-all duration-300 text-base h-14'
                        />
                      )}
                    />
                    {errors.email && <p className='mt-1 text-sm text-red-500'>{errors.email.message}</p>}
                  </div>

                  <div>
                    <Controller
                      name="password"
                      control={control}
                      render={({ field }) => (
                        <AntInput.Password
                          {...field}
                          prefix={<Lock className='mr-2 h-5 w-5 text-gray-400' />}
                          size='large'
                          placeholder={t('password')}
                          status={errors.password ? 'error' : ''}
                          className='hover:border-[#5BA4A4] focus:border-[#5BA4A4] hover:shadow-[0_2px_8px_rgba(91,164,164,0.2)] transition-all duration-300 text-base h-14'
                        />
                      )}
                    />
                    {errors.password && <p className='mt-1 text-sm text-red-500'>{errors.password.message}</p>}
                  </div>
                </div>

                <AntButton
                  type='primary'
                  htmlType='submit'
                  loading={loginAccountMutation.isLoading}
                  className='w-full bg-[#5BA4A4] hover:!bg-[#4A8A8A] hover:shadow-[0_4px_12px_rgba(91,164,164,0.4)] transition-all duration-300 text-lg h-14'
                  size='large'
                >
                  {t('sign in')}
                </AntButton>
              </form>

              <Divider className='my-10'>{t('or')}</Divider>

              <div className='text-center'>
                <p className='text-gray-600 text-base'>
                  {t('login_desc')}{' '}
                  <Link to='/register' className='font-semibold text-[#5BA4A4] hover:text-[#4A8A8A]'>
                    {t('sign up')}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Login
