import { yupResolver } from '@hookform/resolvers/yup'
import { useContext } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from 'react-query'
import { Link, useNavigate } from 'react-router-dom'
import AuthApi from '~/apis/authApi'
import Button from '~/components/Button'
import { AppContext } from '~/Contexts/app.context'
import Input from '~/components/Input'
import path from '~/constants/path'
import { errorResponse } from '~/types/utils.type'
import { LoginFormData, loginSchema } from '~/utils/rulesForm'
import { isAxiosErrorUnprocessableEntity } from '~/utils/utils'
import useScrollTop from '~/hooks/useScrollTop'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'

const Login = () => {
  const { t } = useTranslation('login')
  useScrollTop()
  const {
    register,
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
      <div className='bg-orange'>
        <div className='container py-[80px]'>
          <div className='flex items-center justify-center lg:justify-end'>
            <form
              onSubmit={onSubmit}
              className='min-h-[430px] w-[400px] rounded bg-[#fff] p-[30px] shadow-lg'
              noValidate
            >
              <div className='text-[20px]'>{t('sign in')}</div>
              <Input
                className='mt-8'
                errorMessage={errors.email?.message}
                placeholder='Email'
                type='email'
                name='email'
                register={register}
              />
              <Input
                className='mt-3'
                classNameInput='w-full outline-none border px-4 py-2 border-[#00000024] rounded-sm'
                classNameError='text-[#ff424f] min-h-[1.5rem] text-sm pt-1 pl-1'
                errorMessage={errors.password?.message}
                placeholder={t('password')}
                type='password'
                name='password'
                register={register}
              />
              <Button
                disabled={loginAccountMutation.isLoading}
                isLoading={loginAccountMutation.isLoading}
                type='submit'
                className='mt-3 flex w-full items-center justify-center bg-orange/90 px-4 py-2 text-[#fff] hover:bg-orange'
              >
                {t('sign in')}
              </Button>
              <div className='mt-8 flex items-center'>
                <div className='h-[1px] w-full flex-1 bg-[#ccc]'></div>
                <div className='px-4 text-xs text-[#ccc]'>{t('or')}</div>
                <div className='h-[1px] w-full flex-1 bg-[#ccc]'></div>
              </div>
              <div className='mt-6 flex items-center justify-center gap-2'>
                <div className='text-sm text-[#ccc]'>{t('login_desc')} </div>
                <Link title={t('sign up')} className='text-sm text-orange' to='/register'>
                  {t('sign up')}
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default Login
