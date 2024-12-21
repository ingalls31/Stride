import { yupResolver } from '@hookform/resolvers/yup'
import omit from 'lodash/omit'
import { useContext } from 'react'
import { Helmet } from 'react-helmet-async'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useMutation } from 'react-query'
import { toast } from 'react-toastify'
import { AppContext } from '~/Contexts/app.context'
import userApi from '~/apis/userApi'
import { Input as AntInput, Button as AntButton, ConfigProvider } from 'antd'
import { Lock } from 'lucide-react'
import { Controller, FormProvider } from 'react-hook-form'
import useScrollTop from '~/hooks/useScrollTop'
import { errorResponse } from '~/types/utils.type'
import { UserSchema, userSchema } from '~/utils/rulesForm'
import { isAxiosErrorUnprocessableEntity } from '~/utils/utils'

type FormData = Pick<UserSchema, 'password' | 'confirm_password' | 'new_password'>
const passwordSchema = userSchema.pick(['password', 'confirm_password', 'new_password'])

export default function ChangePassword() {
  const { t } = useTranslation('profile')
  const { profile } = useContext(AppContext)
  useScrollTop()
  const methods = useForm<FormData>({
    defaultValues: {
      password: '',
      new_password: '',
      confirm_password: ''
    },
    resolver: yupResolver(passwordSchema)
  })

  const updatePasswordMutation = useMutation({
    mutationFn: userApi.updateProfile
  })

  const onSubmit = methods.handleSubmit(async (data) => {
    try {
      const res = await updatePasswordMutation.mutateAsync({
        id: profile?.id,
        ...omit(data, ['confirm_password'])
      })
      toast.success(res.data.message, {
        autoClose: 2000,
        position: 'top-center',
        hideProgressBar: true
      })
      methods.reset()
    } catch (error) {
      if (isAxiosErrorUnprocessableEntity<errorResponse<FormData>>(error)) {
        const formError = error.response?.data.data
        if (formError) {
          Object.keys(formError).forEach((key) => {
            methods.setError(key as keyof FormData, {
              message: formError[key as keyof FormData] as string,
              type: 'Server'
            })
          })
        }
      }
    }
  })

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#f97316',
          borderRadius: 6
        }
      }}
    >
      <Helmet>
        <title>{`${t('change password')} | Stride`}</title>
        <meta name='description' content='Page change password Stride' />
      </Helmet>
      <div className='rounded-lg bg-white px-8 py-6 shadow'>
        <div className='border-b border-b-gray-200 pb-5'>
          <h1 className='text-xl font-medium text-gray-800'>{t('change password')}</h1>
          <div className='text-sm text-gray-600'>{t('desc_password')}</div>
        </div>
        <FormProvider {...methods}>
          <form onSubmit={onSubmit} className='pt-8 text-sm' noValidate>
            <div className='flex-1 pr-0 sm:pr-12'>
              <div className='flex gap-5 pb-5'>
                <label className='mt-2 min-w-[20%] text-right text-gray-500'>{t('current password')}</label>
                <div className='flex-1'>
                  <Controller
                    name='password'
                    control={methods.control}
                    render={({ field: { value, ...field } }) => (
                      <AntInput.Password
                        {...field}
                        value={value as string}
                        size='large'
                        prefix={<Lock className='h-5 w-5 text-gray-400' />}
                        status={methods.formState.errors.password ? 'error' : ''}
                        className='w-full'
                      />
                    )}
                  />
                  {methods.formState.errors.password && (
                    <p className='mt-1 text-sm text-red-500'>{methods.formState.errors.password.message}</p>
                  )}
                </div>
              </div>

              <div className='flex gap-5 pb-5'>
                <label className='mt-2 min-w-[20%] text-right text-gray-500'>{t('new password')}</label>
                <div className='flex-1'>
                  <Controller
                    name='new_password'
                    control={methods.control}
                    render={({ field: { value, ...field } }) => (
                      <AntInput.Password
                        {...field}
                        value={value as string}
                        size='large'
                        prefix={<Lock className='h-5 w-5 text-gray-400' />}
                        status={methods.formState.errors.new_password ? 'error' : ''}
                        className='w-full'
                      />
                    )}
                  />
                  {methods.formState.errors.new_password && (
                    <p className='mt-1 text-sm text-red-500'>{methods.formState.errors.new_password.message}</p>
                  )}
                </div>
              </div>

              <div className='flex gap-5 pb-5'>
                <label className='mt-2 min-w-[20%] text-right text-gray-500'>{t('confirm password')}</label>
                <div className='flex-1'>
                  <Controller
                    name='confirm_password'
                    control={methods.control}
                    render={({ field }) => (
                      <AntInput.Password
                        {...field}
                        size='large'
                        prefix={<Lock className='h-5 w-5 text-gray-400' />}
                        status={methods.formState.errors.confirm_password ? 'error' : ''}
                        className='w-full'
                      />
                    )}
                  />
                  {methods.formState.errors.confirm_password && (
                    <p className='mt-1 text-sm text-red-500'>{methods.formState.errors.confirm_password.message}</p>
                  )}
                </div>
              </div>
            </div>
          </form>
          <div className='mt-8 flex justify-end border-t border-gray-200 pt-6'>
            <AntButton
              size='large'
              htmlType='submit'
              loading={updatePasswordMutation.isLoading}
              type='primary'
              className='!bg-orange hover:!bg-orange/90'
              onClick={onSubmit}
            >
              {t('save')}
            </AntButton>
          </div>
        </FormProvider>
      </div>
    </ConfigProvider>
  )
}
