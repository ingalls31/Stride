/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { yupResolver } from '@hookform/resolvers/yup'
import { useContext, useEffect, useMemo, useState } from 'react'
import { useForm, Controller, FormProvider } from 'react-hook-form'
import { useMutation, useQuery } from 'react-query'
import userApi from '~/apis/userApi'
import { Input as AntInput, Button as AntButton, DatePicker, Upload, ConfigProvider } from 'antd'
import { UserCircle, Upload as UploadIcon, User, Phone, MapPin, Calendar } from 'lucide-react'
import { UserSchema, userSchema } from '~/utils/rulesForm'
import { setProfileToLS } from '~/utils/auth'
import { AppContext } from '~/Contexts/app.context'
import { toast } from 'react-toastify'
import { isAxiosErrorUnprocessableEntity } from '~/utils/utils'
import { errorResponse } from '~/types/utils.type'
import useScrollTop from '~/hooks/useScrollTop'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'

type FormData = Pick<
  UserSchema,
  'first_name' | 'last_name' | 'address' | 'phone_number' | 'date_of_birth' | 'avatar' | 'is_superuser'
>
type FormDataError = Omit<FormData, 'date_of_birth'> & {
  date_of_birth?: Date | string
}
const profileSchema = userSchema.pick([
  'first_name',
  'last_name',
  'address',
  'phone_number',
  'date_of_birth',
  'avatar'
])

export default function Profile() {
  const { t } = useTranslation('profile')
  useScrollTop()
  const [fileImg, setFileImg] = useState<File>()
  const { setProfile } = useContext(AppContext)
  const methods = useForm<FormData>({
    defaultValues: {
      first_name: '',
      last_name: '',
      phone_number: '',
      address: '',
      date_of_birth: dayjs().toDate(),
      avatar: ''
    },
    resolver: yupResolver(profileSchema)
  })

  const { data: profileData, refetch } = useQuery({
    queryKey: ['profile'],
    queryFn: userApi.getProfile
  })

  const profile = profileData?.data.results[0]

  const updateProfileMutation = useMutation({
    mutationFn: userApi.updateProfile
  })

  const updateAvatarProfileMutation = useMutation({
    mutationFn: userApi.updateAvatarProfile
  })

  const previewAvatar = useMemo(() => {
    return fileImg ? URL.createObjectURL(fileImg) : ''
  }, [fileImg])

  useEffect(() => {
    if (profile) {
      console.log('profile', profile)
      methods.setValue('first_name', profile.first_name)
      methods.setValue('last_name', profile.last_name)
      methods.setValue('phone_number', profile.phone_number)
      methods.setValue('address', profile.address)
      methods.setValue(
        'date_of_birth',
        profile.date_of_birth ? dayjs(profile.date_of_birth).toDate() : dayjs().toDate()
      )
    }
  }, [profile, methods])

  const onSubmit = methods.handleSubmit(async (data) => {
    console.log('🚀 ~ onSubmit ~ data:', data)
    try {
      let avatarID = profile?.avatar
      if (fileImg) {
        const form = new FormData()
        form.append('image', fileImg)
        const uploadRes = await updateAvatarProfileMutation.mutateAsync(form)
        avatarID = uploadRes.data.id
        methods.setValue('avatar', avatarID)
      }
      const res = await updateProfileMutation.mutateAsync({
        id: profile.id,
        ...data,
        date_of_birth: dayjs(data.date_of_birth).format('YYYY-MM-DD'),
        avatar: avatarID
      })
      setProfile(res.data)
      setProfileToLS(res.data)
      refetch()
      toast.success(res.data.message, {
        autoClose: 2000,
        hideProgressBar: true,
        position: 'top-center'
      })
    } catch (error) {
      if (isAxiosErrorUnprocessableEntity<errorResponse<FormDataError>>(error)) {
        const formError = error.response?.data.data
        if (formError) {
          Object.keys(formError).forEach((key) => {
            methods.setError(key as keyof FormDataError, {
              message: String(formError[key as keyof FormDataError]),
              type: 'Server'
            })
          })
        }
      }
    }
  })

  const handleChangeInputFile = (file: File) => {
    setFileImg(file)
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#f97316', // orange-500
          borderRadius: 6
        }
      }}
    >
      <Helmet>
        <title>{`${t('profile')} | Stride`}</title>
        <meta name='description' content='Page profile Stride' />
      </Helmet>
      <div className='rounded-lg bg-white px-8 py-6 shadow'>
        <div className='border-b border-b-gray-200 pb-5'>
          <h1 className='text-xl font-medium text-gray-800'>{t('my profile')}</h1>
          <div className='text-sm text-gray-600'>{t('desc_profile')}</div>
        </div>
        <FormProvider {...methods}>
          <form onSubmit={onSubmit} className='flex flex-col-reverse pt-8 text-sm lg:flex-row' noValidate>
            <div className='flex-1 pr-0 sm:pr-12'>
              <div className='flex items-center gap-5 pb-8'>
                <span className='min-w-[20%] text-right text-gray-500'>Email</span>
                <span className='text-gray-700'>{profile?.email}</span>
              </div>

              <div className='flex gap-5 pb-5'>
                <label className='mt-2 min-w-[20%] text-right text-gray-500'>{t('first_name')}</label>
                <div className='flex-1'>
                  <Controller
                    name='first_name'
                    control={methods.control}
                    render={({ field }) => (
                      <AntInput
                        {...field}
                        size='large'
                        prefix={<User className='h-5 w-5 text-gray-400' />}
                        status={methods.formState.errors.first_name ? 'error' : ''}
                        className='w-full'
                      />
                    )}
                  />
                  {methods.formState.errors.first_name && (
                    <p className='mt-1 text-sm text-red-500'>{methods.formState.errors.first_name.message}</p>
                  )}
                </div>
              </div>

              <div className='flex gap-5 pb-5'>
                <label className='mt-2 min-w-[20%] text-right text-gray-500'>{t('last_name')}</label>
                <div className='flex-1'>
                  <Controller
                    name='last_name'
                    control={methods.control}
                    render={({ field }) => (
                      <AntInput
                        {...field}
                        size='large'
                        prefix={<User className='h-5 w-5 text-gray-400' />}
                        status={methods.formState.errors.last_name ? 'error' : ''}
                        className='w-full'
                      />
                    )}
                  />
                  {methods.formState.errors.last_name && (
                    <p className='mt-1 text-sm text-red-500'>{methods.formState.errors.last_name.message}</p>
                  )}
                </div>
              </div>

              <div className='flex gap-5 pb-5'>
                <label className='mt-2 min-w-[20%] text-right text-gray-500'>{t('phone')}</label>
                <div className='flex-1'>
                  <Controller
                    name='phone_number'
                    control={methods.control}
                    render={({ field }) => (
                      <AntInput
                        {...field}
                        size='large'
                        prefix={<Phone className='h-5 w-5 text-gray-400' />}
                        status={methods.formState.errors.phone_number ? 'error' : ''}
                        className='w-full'
                      />
                    )}
                  />
                  {methods.formState.errors.phone_number && (
                    <p className='mt-1 text-sm text-red-500'>
                      {methods.formState.errors.phone_number.message}
                    </p>
                  )}
                </div>
              </div>

              <div className='flex gap-5 pb-5'>
                <label className='mt-2 min-w-[20%] text-right text-gray-500'>{t('address')}</label>
                <div className='flex-1'>
                  <Controller
                    name='address'
                    control={methods.control}
                    render={({ field }) => (
                      <AntInput
                        {...field}
                        size='large'
                        prefix={<MapPin className='h-5 w-5 text-gray-400' />}
                        status={methods.formState.errors.address ? 'error' : ''}
                        className='w-full'
                      />
                    )}
                  />
                  {methods.formState.errors.address && (
                    <p className='mt-1 text-sm text-red-500'>{methods.formState.errors.address.message}</p>
                  )}
                </div>
              </div>

              <div className='flex gap-5 pb-5'>
                <label className='mt-2 min-w-[20%] text-right text-gray-500'>Ngày sinh</label>
                <div className='flex-1'>
                  <Controller
                    name='date_of_birth'
                    // control={methods.control}
                    render={({ field }) => (
                      <DatePicker
                        className='w-full'
                        size='large'
                        prefix={<Calendar className='h-5 w-5 text-gray-400' />}
                        value={dayjs(methods.getValues('date_of_birth'))}
                        onChange={(date) => {
                          field.onChange(date ? date.toDate() : null)
                        }}
                        status={methods.formState.errors.date_of_birth ? 'error' : ''}
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            <div className='mb-3 flex h-fit w-full justify-center border-l-gray-200 lg:mb-0 lg:w-[280px] lg:border-l lg:pl-8'>
              <div className='flex flex-col items-center'>
                <div className='relative'>
                  {previewAvatar || profile?.avatar_url ? (
                    <img
                      className='my-5 h-24 w-24 rounded-full object-cover ring-2 ring-gray-200'
                      src={previewAvatar || profile?.avatar_url}
                      alt='avatar'
                    />
                  ) : (
                    <UserCircle className='my-5 h-24 w-24 text-gray-400' />
                  )}
                </div>

                <Upload
                  accept='image/*'
                  showUploadList={false}
                  beforeUpload={(file) => {
                    handleChangeInputFile(file)
                    return false
                  }}
                >
                  <AntButton size='large' icon={<UploadIcon className='h-4 w-4' />}>
                    Upload
                  </AntButton>
                </Upload>

                <div className='mt-3 text-center text-gray-500'>
                  <div>{t('file size')}</div>
                  <div>{t('file extension')}</div>
                </div>
              </div>
            </div>
          </form>
          <div className='mt-8 flex justify-end border-t border-gray-200 pt-6'>
            <AntButton
              size='large'
              htmlType='submit'
              loading={updateProfileMutation.isLoading}
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
