import { useRef, useState } from 'react';
import {
  Table,
  ActionIcon,
  Text,
  Tooltip,
  Group,
  Button,
  rem,
  useMantineTheme,
  Flex,
  Center,
} from '@mantine/core';
import { IconX, IconTrash, IconDownload } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { Dropzone, MIME_TYPES } from '@mantine/dropzone';
import classes from './BankStatementsDragAndDrop.module.css';
import { SelectBankTypeDropdown } from '@/components/review/crud/SelectBankTypeDropdown/SelectBankTypeDropdown';
import CreateBankTypeButton from '@/components/banktype/crud/CreateBankTypeButton/CreateBankTypeButton';
import { BankType } from '@prisma/client';

interface FormValues {
  bank_statements: BankStatement[];
}

interface BankStatement {
  client_company: string;
  name: string;
  type: string;
  file: File | null;
}

export function BankStatementsDragAndDrop() {
  const theme = useMantineTheme();
  const openRef = useRef<() => void>(null);
  const form = useForm<FormValues>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedBankTypes, setSelectedBankTypes] = useState<(BankType | null)[]>([]);
  const [isDropzoneEmpty, setIsDropzoneEmpty] = useState(true);

  const handleDrop = (files: File[]) => {
    // Update the form values with the dropped files
    const updatedBankStatements = files.map((file) => ({
      client_company: '',
      name: file.name,
      type: '',
      file: file,
    }));
    form.setFieldValue('bank_statements', updatedBankStatements);
  };

  const handleRemoveFile = (indexToRemove: number) => {
    form.removeListItem('bank_statements', indexToRemove);
    const updatedBankStatements = form.values.bank_statements.filter(
      (_, idx) => idx !== indexToRemove
    );
    setIsDropzoneEmpty(
      updatedBankStatements.length === 0 ||
        updatedBankStatements.every((statement) => !statement.file)
    );
  };

  const handleBankTypeChange = (selectedBankType: BankType | null, index: number) => {
    setSelectedBankTypes((prevSelectedBankTypes) => {
      const updatedSelectedBankTypes = [...prevSelectedBankTypes];
      updatedSelectedBankTypes[index] = selectedBankType;
      return updatedSelectedBankTypes;
    });

    const updatedBankStatements = form.values.bank_statements.map((statement, i) => {
      if (i === index) {
        return { ...statement, type: selectedBankType?.name || '' };
      }
      return statement;
    });
    form.setFieldValue('bank_statements', updatedBankStatements);
    setIsDropzoneEmpty(updatedBankStatements.length === 0);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true); // Start submitting process
    const formData = new FormData();

    // Assuming you keep track of files in a state variable
    form.values.bank_statements.forEach((statement) => {
      if (statement.file) {
        formData.append('files[]', statement.file, statement.name + '_' + statement.type);
      }
    });

    try {
      console.log(formData);
      const response = await fetch('http://localhost:8000/process-csv', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      console.log(result); // Handle the response based on your requirements
      setIsSubmitting(false);
    } catch (error) {
      console.error('Failed to submit:', error);
      setIsSubmitting(false);
      setSubmitError('Failed to submit files. Please try again.');
    }
  };

  const selectedBankStatements =
    form.values.bank_statements?.map((statement, index) => (
      <Table.Tr key={index}>
        <Table.Td style={{ maxWidth: rem(250) }}>
          <Tooltip
            arrowOffset={50}
            arrowSize={5}
            withArrow
            position="top-start"
            label={statement.file ? `${statement.file.name}` : 'Unknown'}
          >
            <Text truncate="end">{statement.file ? `${statement.file.name}` : 'Unknown'}</Text>
          </Tooltip>
        </Table.Td>
        <Table.Td style={{ minWidth: rem(78) }}>
          <Text>
            {statement.file ? `${((statement.file.size / 1024) * 0.001).toFixed(2)} mb` : 'Unknown'}
          </Text>
        </Table.Td>
        <Table.Td style={{ minWidth: rem(57) }}>
          <SelectBankTypeDropdown
            onChange={(selectedBankType) => handleBankTypeChange(selectedBankType, index)}
          />
        </Table.Td>
        <Table.Td>
          <Center>
            <ActionIcon color="red" onClick={() => handleRemoveFile(index)}>
              {' '}
              <IconTrash size="1rem" />
            </ActionIcon>
          </Center>
        </Table.Td>
      </Table.Tr>
    )) || [];

  const isSubmitDisabled =
    isDropzoneEmpty ||
    form.values.bank_statements.some((statement) => !statement.type) ||
    selectedBankTypes.some((type) => type === null);

  return (
    <div>
      <div className={classes.wrapper}>
        <Dropzone
          openRef={openRef}
          onDrop={handleDrop}
          onReject={() => console.log('File is not supported or there is an error')} //change to make a fancy notification
          className={classes.dropzone}
          radius="sm"
          accept={[MIME_TYPES.csv, MIME_TYPES.xls]} //.xls takes my csv files but the .csv did not allow it
          maxSize={30 * 1024 ** 2}
          style={{ borderStyle: 'dashed', borderWidth: 2, borderRadius: 10, color: 'dimgray' }}
        >
          <Group justify="center">
            <div style={{ pointerEvents: 'none' }}>
              <Group justify="center">
                <Dropzone.Accept>
                  <IconDownload
                    style={{ width: rem(50), height: rem(50) }}
                    color={theme.colors.blue[6]}
                    stroke={1.5}
                  />
                </Dropzone.Accept>
                <Dropzone.Reject>
                  <IconX
                    style={{ width: rem(50), height: rem(50) }}
                    color={theme.colors.red[6]}
                    stroke={1.5}
                  />
                </Dropzone.Reject>
                <Dropzone.Idle>
                  <IconDownload style={{ width: rem(50), height: rem(50) }} stroke={1.5} />
                </Dropzone.Idle>
              </Group>

              <Text ta="center" fw={700} fz="lg" mt="sm">
                <Dropzone.Accept>Drop the Bank Statements</Dropzone.Accept>
                <Dropzone.Reject>
                  Incorrect file type or file size is more than 30mb{' '}
                </Dropzone.Reject>
                <Dropzone.Idle>Upload Bank Statements</Dropzone.Idle>
              </Text>
              <Text ta="center" fz="sm" mt="xs" c="dimmed" pb="sm">
                Drag&apos;n&apos;drop files here to upload. We can accept only <i>.csv</i> files
                that are less than 30mb in size.
              </Text>
            </div>
            <div>
              <Button
                className={classes.control}
                size="md"
                radius="xl"
                onClick={() => openRef.current?.()}
              >
                Select files
              </Button>
            </div>
          </Group>
        </Dropzone>
      </div>
      <div></div>
      <Text pb={1} ta="center" fw={700}>
        Selected Bank Statements
      </Text>
      <Flex style={{ height: rem(200) }}>
        <Table.ScrollContainer minWidth={500}>
          <Table striped stickyHeader highlightOnHover withTableBorder withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ maxWidth: rem(250) }}>Bank Statement</Table.Th>
                <Table.Th style={{ minWidth: rem(78) }}>Size</Table.Th>
                <Table.Th style={{ minWidth: rem(57) }}>Type</Table.Th>
                <Table.Th>Delete</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{selectedBankStatements}</Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Flex>
      <Flex
        direction={{ base: 'column', sm: 'row' }}
        justify="space-between"
        align="flex-end"
        mt={10}
        mb={5}
        style={{ gap: '16px' }}
      >
        <CreateBankTypeButton />
        {isSubmitDisabled ? (
          <Tooltip
            label="Select a statement and ensure all have a bank type to enable submit."
            position="bottom"
            withArrow
          >
            <Button
              disabled={isSubmitDisabled}
              className={classes.submitButton}
              loading={isSubmitting}
            >
              Submit
            </Button>
          </Tooltip>
        ) : (
          <Button onClick={handleSubmit} className={classes.submitButton} loading={isSubmitting}>
            Submit
          </Button>
        )}
      </Flex>
    </div>
  );
}
