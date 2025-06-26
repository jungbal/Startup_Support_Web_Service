import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { getMemberInfo, updateMember, checkUserEmail } from '../../api/memberApi';

// 유효성 검증 스키마
const schema = yup.object({
  userName: yup.string().required('이름을 입력하세요'),
  userPhone: yup
    .string()
    .required('전화번호를 입력하세요')
    .matches(/^01[0-9]-[0-9]{4}-[0-9]{4}$/, '올바른 전화번호 형식이 아닙니다'),
  userEmail: yup
    .string()
    .required('이메일을 입력하세요')
    .email('올바른 이메일 형식이 아닙니다'),
  userAddr: yup.string().required('주소를 입력하세요'),
});

const ProfileEdit = () => {
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState(null);
  const [emailCheckStatus, setEmailCheckStatus] = useState(null);
  const [checkedEmail, setCheckedEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setError,
    clearErrors,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      userName: user?.userName || '',
      userPhone: user?.userPhone || '',
      userEmail: user?.userEmail || '',
      userAddr: user?.userAddr || '',
    },
  });

  const watchEmail = watch('userEmail');

  // 이메일이 변경되면 중복체크 상태 초기화
  useEffect(() => {
    if (watchEmail !== checkedEmail && watchEmail !== user?.userEmail) {
      setEmailCheckStatus(null);
      if (errors.userEmail && errors.userEmail.message === '이미 사용중인 이메일입니다') {
        clearErrors('userEmail');
      }
    }
  }, [watchEmail, checkedEmail, user?.userEmail, errors.userEmail, clearErrors]);

  // 이메일 중복 체크
  const handleCheckUserEmail = async () => {
    if (!watchEmail) {
      toast.error('이메일을 입력해주세요');
      return;
    }

    // 현재 사용자의 이메일과 같으면 중복체크 안함
    if (watchEmail === user?.userEmail) {
      toast.info('현재 사용중인 이메일입니다');
      return;
    }

    clearErrors('userEmail');
    setEmailCheckStatus('checking');
    
    try {
      const response = await checkUserEmail(watchEmail);
      
      if (response.resData === 0) {
        setEmailCheckStatus('available');
        setCheckedEmail(watchEmail);
        toast.success('사용 가능한 이메일입니다');
      } else {
        setEmailCheckStatus('unavailable');
        setError('userEmail', { message: '이미 사용중인 이메일입니다' });
        toast.error('이미 사용중인 이메일입니다');
      }
    } catch (error) {
      setEmailCheckStatus(null);
      toast.error('이메일 중복 체크 중 오류가 발생했습니다');
    }
  };

  // 사용자 정보 초기화 (authStore user 데이터 사용)
  useEffect(() => {
    console.log('ProfileEdit - user 변경됨:', user);
    if (user && user.userName && user.userPhone && user.userEmail) {
      const formData = {
        userName: user.userName,
        userPhone: user.userPhone,
        userEmail: user.userEmail,
        userAddr: user.userAddr || '',
      };
      console.log('authStore에서 가져온 데이터로 폼 초기화:', formData);
      reset(formData);
      setInitialData(formData);
    }
  }, [user, reset]);

  // 최신 사용자 정보 불러오기 (컴포넌트 마운트 시 항상 실행)
  useEffect(() => {
    const fetchUserInfo = async () => {
      console.log('ProfileEdit - fetchUserInfo 호출됨');
      console.log('현재 user:', user);
      
      if (!user?.userId) {
        console.log('user.userId가 없음');
        return;
      }
      
      try {
        console.log('getMemberInfo API 호출 중...');
        const response = await getMemberInfo(user.userId);
        console.log('getMemberInfo 응답:', response);
        
        if (response.alertIcon === 'success') {
          const userData = response.resData;
          console.log('가져온 사용자 데이터:', userData);
          
          const formData = {
            userName: userData.userName,
            userPhone: userData.userPhone,
            userEmail: userData.userEmail,
            userAddr: userData.userAddr,
          };
          console.log('API에서 가져온 데이터로 폼 업데이트:', formData);
          reset(formData);
          setInitialData(formData);
          
          // authStore도 최신 정보로 업데이트
          updateUser(formData);
          console.log('authStore도 최신 정보로 업데이트됨');
        } else {
          console.log('getMemberInfo 실패:', response.clientMsg);
          toast.error('회원 정보를 불러오는데 실패했습니다.');
        }
      } catch (error) {
        console.error('getMemberInfo 오류:', error);
        toast.error('회원 정보를 불러오는데 실패했습니다.');
      }
    };

    // 컴포넌트 마운트 시 항상 최신 정보 가져오기
    if (user?.userId) {
      fetchUserInfo();
    }
  }, [user?.userId, reset, updateUser]);

  const onSubmit = async (data) => {
    console.log('ProfileEdit - onSubmit 시작');
    console.log('현재 user:', user);
    console.log('폼 데이터:', data);

    // 이메일이 변경되었고 중복체크를 하지 않은 경우
    if (data.userEmail !== user?.userEmail && 
        (emailCheckStatus !== 'available' || checkedEmail !== data.userEmail)) {
      toast.error('변경된 이메일의 중복 체크를 해주세요');
      return;
    }
    
    setLoading(true);
    try {
      const updateData = {
        userId: user.userId,
        ...data,
      };
      console.log('수정 요청 데이터:', updateData);

      const response = await updateMember(updateData);
      console.log('수정 응답:', response);
      console.log('응답 alertIcon:', response.alertIcon);
      console.log('응답 clientMsg:', response.clientMsg);
      
      if (response.alertIcon === 'success') {
        toast.success('정보가 수정되었습니다.');
        setInitialData(data);
        
        // authStore의 사용자 정보 업데이트
        updateUser({
          userName: data.userName,
          userPhone: data.userPhone,
          userEmail: data.userEmail,
          userAddr: data.userAddr,
        });
        console.log('authStore 사용자 정보 업데이트됨');
      } else {
        console.log('수정 실패 - alertIcon이 success가 아님');
        toast.error(response.clientMsg || '수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('수정 중 오류 발생:', error);
      toast.error('수정 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (initialData) {
      reset(initialData);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        기본 정보 수정
      </Typography>
      
      <form onSubmit={handleSubmit(onSubmit)} className="mypage-form">
        <TextField
          {...register('userName')}
          label="이름"
          fullWidth
          error={!!errors.userName}
          helperText={errors.userName?.message}
          disabled={loading}
        />

        <TextField
          {...register('userPhone')}
          label="전화번호"
          fullWidth
          placeholder="010-0000-0000"
          error={!!errors.userPhone}
          helperText={errors.userPhone?.message}
          disabled={loading}
        />

        <Box sx={{ position: 'relative' }}>
          <TextField
            {...register('userEmail')}
            label="이메일"
            fullWidth
            type="email"
            error={!!errors.userEmail}
            helperText={errors.userEmail?.message}
            disabled={loading}
            InputProps={{
              endAdornment: (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {emailCheckStatus === 'checking' && <CircularProgress size={20} />}
                  {emailCheckStatus === 'available' && <CheckCircle color="success" />}
                  {emailCheckStatus === 'unavailable' && <Cancel color="error" />}
                  {watchEmail && watchEmail !== user?.userEmail && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleCheckUserEmail}
                      disabled={loading || emailCheckStatus === 'checking'}
                    >
                      중복확인
                    </Button>
                  )}
                </Box>
              ),
            }}
          />
        </Box>

        <TextField
          {...register('userAddr')}
          label="주소"
          fullWidth
          error={!!errors.userAddr}
          helperText={errors.userAddr?.message}
          disabled={loading}
        />

        <Box className="mypage-button-group">
          <Button
            type="button"
            variant="outlined"
            onClick={handleReset}
            disabled={loading}
          >
            초기화
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} />}
          >
            수정하기
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default ProfileEdit; 