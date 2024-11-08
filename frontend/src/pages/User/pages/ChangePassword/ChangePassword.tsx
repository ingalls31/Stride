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
import Input from '~/components/Input'
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
  const {
    register,
    setError,
    reset,
    formState: { errors },
    handleSubmit
  } = useForm<FormData>({
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

  const onSubmit = handleSubmit(async (data) => {
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
      reset()
    } catch (error) {
      if (isAxiosErrorUnprocessableEntity<errorResponse<FormData>>(error)) {
        const formError = error.response?.data.data
        if (formError) {
          Object.keys(formError).forEach((key) => {
            setError(key as keyof FormData, {
              message: formError[key as keyof FormData] as string,
              type: 'Server'
            })
          })
        }
      }
    }
  })

  return (
    <>
      <Helmet>
        <title>{`${t('change password')} | Stride`}</title>
        <meta name='description' content='Page change password Stride' />
      </Helmet>
      <div style={{ height: '70vh' }}>
        <div className='rounded-sm bg-white px-4 py-[18px] shadow sm:px-[30px]'>
          <div className='border-b border-b-gray-200 pb-[18px]'>
            <h1 className='text-lg font-medium'>{t('change password')}</h1>
            <div className='text-sm'>{t('desc_password')}</div>
          </div>
          <form onSubmit={onSubmit} className='flex pt-[30px] text-sm' noValidate>
            <div className='w-full flex-1 pr-0 sm:pr-[50px]'>
              <div className='flex flex-col gap-5 pb-[15px] sm:flex-row'>
                <label htmlFor='password' className='mt-2 min-w-[25%] text-gray-400 sm:text-right'>
                  {t('current password')}
                </label>
                <Input
                  register={register}
                  errorMessage={errors.password?.message}
                  type='password'
                  classNameInput='w-full sm:w-[360px] border border-gray-200 p-[9px] shadow-inner outline-none focus:border-gray-400'
                  id='password'
                  name='password'
                />
              </div>
              <div className='flex flex-col gap-5 pb-[15px] sm:flex-row'>
                <label htmlFor='new_password' className='mt-2 min-w-[25%] text-gray-400 sm:text-right'>
                  {t('new password')}
                </label>
                <Input
                  register={register}
                  errorMessage={errors.new_password?.message}
                  type='password'
                  classNameInput='w-full sm:w-[360px] border border-gray-200 p-[9px] shadow-inner outline-none focus:border-gray-400'
                  id='new_password'
                  name='new_password'
                />
              </div>
              <div className='flex flex-col gap-5 pb-[15px] sm:flex-row'>
                <label htmlFor='confirm_password' className='mt-2 min-w-[25%] text-gray-400 sm:text-right'>
                  {t('confirm password')}
                </label>
                <Input
                  register={register}
                  errorMessage={errors.confirm_password?.message}
                  type='password'
                  classNameInput='w-full sm:w-[360px] border border-gray-200 p-[9px] shadow-inner outline-none focus:border-gray-400'
                  id='confirm_password'
                  name='confirm_password'
                />
              </div>
              <div className='flex items-center gap-5 pb-16'>
                <div className='hidden min-w-[25%] sm:block'></div>
                <button
                  type='submit'
                  className='w-full rounded-sm bg-orange px-5 py-[10px] text-white sm:w-auto'
                >
                  {t('save')}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
