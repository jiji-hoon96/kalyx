import { useForm, Controller } from 'react-hook-form';
import { DatePicker } from '@kalyx/react';

type FormValues = { birthday: string | null };

export default function App() {
  const { control, handleSubmit, formState } = useForm<FormValues>({
    defaultValues: { birthday: null },
  });

  const onSubmit = (values: FormValues) => {
    alert(JSON.stringify(values, null, 2));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ padding: 32, fontFamily: 'sans-serif' }}>
      <h1>Kalyx — DatePicker × React Hook Form</h1>
      <Controller
        name="birthday"
        control={control}
        rules={{ required: 'Pick a birthday' }}
        render={({ field, fieldState }) => (
          <div>
            <DatePicker value={field.value} onChange={field.onChange}>
              <DatePicker.Input placeholder="Birthday" />
              <DatePicker.Popover>
                <DatePicker.Calendar />
              </DatePicker.Popover>
            </DatePicker>
            {fieldState.error && (
              <p style={{ color: 'crimson' }}>{fieldState.error.message}</p>
            )}
          </div>
        )}
      />
      <button type="submit" style={{ marginTop: 16 }}>Submit</button>
      <pre style={{ marginTop: 16 }}>{JSON.stringify(formState.dirtyFields, null, 2)}</pre>
    </form>
  );
}
