import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  InputAdornment,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
} from '@mui/material';
import { Visibility, VisibilityOff, CheckCircle, Cancel } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { checkPassword, updatePassword } from '../../api/memberApi';

// 유효성 검증 스키마
const schema = yup.object({
  currentPassword: yup.string().required('현재 비밀번호를 입력하세요'),
  newPassword: yup
    .string()
    .required('새 비밀번호를 입력하세요')
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      '비밀번호는 대소문자, 숫자, 특수문자를 포함해야 합니다'
    )
    .test('different-from-current', '현재 비밀번호와 새 비밀번호는 달라야 합니다', function(value) {
      return value !== this.parent.currentPassword;
    }),
  confirmPassword: yup
    .string()
    .required('비밀번호 확인을 입력하세요')
    .oneOf([yup.ref('newPassword')], '비밀번호가 일치하지 않습니다'),
});

const PasswordChange = () => {
  const { loginMember } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const watchCurrentPassword = watch('currentPassword');
  const watchNewPassword = watch('newPassword');
  const watchConfirmPassword = watch('confirmPassword');

  // 비밀번호 유효성 검사 규칙들
  const passwordRules = [
    {
      rule: '최소 8자 이상',
      isValid: watchNewPassword && watchNewPassword.length >= 8,
    },
    {
      rule: '대문자 포함',
      isValid: watchNewPassword && /[A-Z]/.test(watchNewPassword),
    },
    {
      rule: '소문자 포함',
      isValid: watchNewPassword && /[a-z]/.test(watchNewPassword),
    },
    {
      rule: '숫자 포함',
      isValid: watchNewPassword && /\d/.test(watchNewPassword),
    },
    {
      rule: '특수문자 포함 (@$!%*?&)',
      isValid: watchNewPassword && /[@$!%*?&]/.test(watchNewPassword),
    },
    {
      rule: watchNewPassword && watchCurrentPassword ? 
        (watchNewPassword === watchCurrentPassword ? '현재 비밀번호와 같음' : '현재 비밀번호와 다름') :
        '현재 비밀번호와 비교',
      isValid: watchNewPassword && watchCurrentPassword && watchNewPassword !== watchCurrentPassword,
    },
  ];

  const passwordsMatch = watchNewPassword && watchConfirmPassword && watchNewPassword === watchConfirmPassword;

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const onSubmit = (data) => {
    setLoading(true);
    
    // 1. 현재 비밀번호 확인
    checkPassword({
      userId: loginMember.userId,
      userPw: data.currentPassword,
    })
    .then(function(checkResponse) {
      // 팀원들이 배운 방식: response.data에서 확인
      if (checkResponse.data && checkResponse.data.alertIcon !== 'success' || !checkResponse.data?.resData) {
        toast.error('현재 비밀번호가 일치하지 않습니다.');
        setLoading(false);
        return;
      }

      // 2. 새 비밀번호로 변경
      return updatePassword({
        userId: loginMember.userId,
        userPw: data.newPassword,
      });
    })
    .then(function(updateResponse) {
      if (updateResponse) {
        // 팀원들이 배운 방식: response.data에서 확인
        if (updateResponse.data && updateResponse.data.alertIcon === 'success') {
          toast.success('비밀번호가 변경되었습니다.');
          reset();
        } else {
          toast.error(updateResponse.data?.clientMsg || '비밀번호 변경에 실패했습니다.');
        }
      }
    })
    .catch(function(error) {
      console.error('비밀번호 변경 중 오류:', error);
      toast.error('비밀번호 변경 중 오류가 발생했습니다.');
    })
    .finally(function() {
      setLoading(false);
    });
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        비밀번호 변경
      </Typography>
      
      <form onSubmit={handleSubmit(onSubmit)} className="mypage-form">
        <TextField
          {...register('currentPassword')}
          label="현재 비밀번호"
          type={showPasswords.current ? 'text' : 'password'}
          fullWidth
          error={!!errors.currentPassword}
          helperText={errors.currentPassword?.message}
          disabled={loading}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => togglePasswordVisibility('current')}
                  edge="end"
                >
                  {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Box>
          <TextField
            {...register('newPassword')}
            label="새 비밀번호"
            type={showPasswords.new ? 'text' : 'password'}
            fullWidth
            error={!!errors.newPassword}
            helperText={errors.newPassword?.message}
            disabled={loading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => togglePasswordVisibility('new')}
                    edge="end"
                  >
                    {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          
          {/* 실시간 비밀번호 유효성 검증 표시 */}
          {watchNewPassword && (
            <Paper 
              elevation={1} 
              sx={{ 
                mt: 1, 
                mb: 3, // 하단 여백 추가
                p: 2, 
                backgroundColor: '#f5f5f5',
                border: '1px solid #e0e0e0'
              }}
            >
              <Typography variant="subtitle2" gutterBottom>
                비밀번호 조건:
              </Typography>
              <List dense>
                {passwordRules.map((rule, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      {rule.isValid ? 
                        <CheckCircle color="success" fontSize="small" /> : 
                        <Cancel color="error" fontSize="small" />
                      }
                    </ListItemIcon>
                    <ListItemText 
                      primary={rule.rule}
                      primaryTypographyProps={{
                        fontSize: '0.875rem',
                        color: rule.isValid ? 'success.main' : 'error.main'
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </Box>

        <Box sx={{ mt: 2 }}>
          <TextField
            {...register('confirmPassword')}
            label="새 비밀번호 확인"
            type={showPasswords.confirm ? 'text' : 'password'}
            fullWidth
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message || 
              (watchConfirmPassword && !passwordsMatch ? '비밀번호가 일치하지 않습니다' : 
               watchConfirmPassword && passwordsMatch ? '비밀번호가 일치합니다' : '')}
            disabled={loading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {watchConfirmPassword && (
                      passwordsMatch ? 
                        <CheckCircle color="success" fontSize="small" /> :
                        <Cancel color="error" fontSize="small" />
                    )}
                    <IconButton
                      onClick={() => togglePasswordVisibility('confirm')}
                      edge="end"
                    >
                      {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </Box>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Box className="mypage-button-group">
          <Button
            type="button"
            variant="outlined"
            onClick={() => reset()}
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
            변경하기
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default PasswordChange; 