import { useForm, Controller } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation } from 'react-query'
import { useContext } from 'react'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { Input as AntInput, Button as AntButton, Divider, message } from 'antd'
import { Mail, Lock, UserPlus } from 'lucide-react'
import { FormData, schema } from '~/utils/rulesForm'
import AuthApi from '~/apis/authApi'
import omit from 'lodash/omit'
import { isAxiosErrorUnprocessableEntity } from '~/utils/utils'
import { errorResponse } from '~/types/utils.type'
import { AppContext } from '~/Contexts/app.context'
import path from '~/constants/path'
import useScrollTop from '~/hooks/useScrollTop'
import Header from '~/components/Header'

const Register = () => {
  const { t } = useTranslation('login')
  useScrollTop()
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<FormData>({
    resolver: yupResolver(schema)
  })
  const navigate = useNavigate()
  const { setIsAuthenticated, setProfile } = useContext(AppContext)

  const registerAccountMutation = useMutation({
    mutationFn: (data: Omit<FormData, 'confirm_password'>) => AuthApi.register(data)
  })

  const onSubmit = handleSubmit((data: FormData) => {
    const body = omit(data, ['confirm_password'])
    registerAccountMutation.mutate(body, {
      onSuccess: (data) => {
        window.alert('Register account success, please login')
        navigate(path.login)
      },
      onError: (error) => {
        if (isAxiosErrorUnprocessableEntity<errorResponse<Omit<FormData, 'confirm_password'>>>(error)) {
          const formError = error.response?.data.data
          if (formError) {
            Object.keys(formError).forEach((key) => {
              setError(key as keyof Omit<FormData, 'confirm_password'>, {
                message: formError[key as keyof Omit<FormData, 'confirm_password'>],
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
        <title>{`${t('sign up')} | Stride`}</title>
        <meta name='description' content='Page register Stride' />
      </Helmet>
      <div className='min-h-screen bg-gray-50'>
        <Header />
        <div className='container mx-auto px-4'>
          <div className='flex min-h-[calc(100vh-85px)] items-center justify-center'>
            <div className='w-full max-w-2xl rounded-lg bg-white p-10 shadow-[0_0_15px_rgba(91,164,164,0.3)] border-2 border-[#5BA4A4]/30'>
              <div className='mb-10 flex items-center justify-center space-x-2'>
                <UserPlus className='h-8 w-8 text-[#5BA4A4]' />
                <h1 className='text-3xl font-bold text-gray-800'>{t('sign up')}</h1>
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

                  <div>
                    <Controller
                      name="confirm_password"
                      control={control}
                      render={({ field }) => (
                        <AntInput.Password
                          {...field}
                          prefix={<Lock className='mr-2 h-5 w-5 text-gray-400' />}
                          size='large'
                          placeholder={t('confirm_password')}
                          status={errors.confirm_password ? 'error' : ''}
                          className='hover:border-[#5BA4A4] focus:border-[#5BA4A4] hover:shadow-[0_2px_8px_rgba(91,164,164,0.2)] transition-all duration-300 text-base h-14'
                        />
                      )}
                    />
                    {errors.confirm_password && (
                      <p className='mt-1 text-sm text-red-500'>{errors.confirm_password.message}</p>
                    )}
                  </div>
                </div>

                <AntButton
                  type='primary'
                  htmlType='submit'
                  loading={registerAccountMutation.isLoading}
                  className='w-full bg-[#5BA4A4] hover:!bg-[#4A8A8A] hover:shadow-[0_4px_12px_rgba(91,164,164,0.4)] transition-all duration-300 text-lg h-14'
                  size='large'
                >
                  {t('sign up')}
                </AntButton>
              </form>

              <Divider className='my-10'>{t('or')}</Divider>

              <div className='text-center'>
                <p className='text-gray-600 text-base'>
                  {t('register_desc')}{' '}
                  <Link to='/login' className='font-semibold text-[#5BA4A4] hover:text-[#4A8A8A]'>
                    {t('sign in')}
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

export default Register
