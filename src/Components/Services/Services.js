import React, { useState, useEffect } from 'react';
import {
  Alert,
  Button,
  Stack,
  StackItem,
  ToggleGroup,
  ToggleGroupItem,
  Toolbar,
  ToolbarItem,
  ToolbarContent,
  Tooltip,
  FlexItem,
  Flex,
} from '@patternfly/react-core';
import {
  CheckCircleIcon,
  BanIcon,
  ExternalLinkAltIcon,
} from '@patternfly/react-icons';
import propTypes from 'prop-types';
import {
  TableComposable,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
} from '@patternfly/react-table';
import { usePermissions } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';

import { permissions } from './permissionsConfig';

const changeSettingsButton = (isLoading, hasAccess, setIsEditing) => (
  <Button
    ouiaId="secondary-edit-button"
    onClick={() => setIsEditing(true)}
    variant="secondary"
    isAriaDisabled={isLoading || !hasAccess}
  >
    Change settings
  </Button>
);

const Services = ({
  defaults,
  setConfirmChangesOpen,
  onChange,
  isEditing,
  setIsEditing,
}) => {
  const initState = {
    enableCloudConnector: {
      value: defaults.enableCloudConnector,
      isDisabled: false,
    },
    useOpenSCAP: { value: defaults.useOpenSCAP, isDisabled: false },
  };
  const [formState, setFormState] = useState(initState);
  const [madeChanges, setMadeChanges] = useState(false);

  const { hasAccess, isLoading } = usePermissions(
    '',
    [
      'config-manager:activation_keys:*',
      'config-manager:state:read',
      'config-manager:state:write',
      'config-manager:state-changes:read',
      'inventory:*:read',
      'playbook-dispatcher:run:read',
    ],
    false,
    true
  );

  const cancelEditing = () => {
    setFormState(initState);
    setIsEditing(false);
  };

  useEffect(() => {
    setMadeChanges(
      formState.useOpenSCAP.value !== defaults.useOpenSCAP ||
        formState.enableCloudConnector.value != defaults.enableCloudConnector
    );
    onChange({
      useOpenSCAP: formState.useOpenSCAP.value,
      enableCloudConnector: formState.enableCloudConnector.value,
    });
  }, [formState]);

  const getStatusIcon = (row) => {
    if (formState[row.id].value) {
      return (
        <Flex style={{ color: 'var(--pf-global--success-color--200)' }}>
          <FlexItem spacer={{ default: 'spacerXs' }}>
            <CheckCircleIcon />
          </FlexItem>
          <FlexItem className="status">
            <b>Enabled</b>
          </FlexItem>
        </Flex>
      );
    }
    return (
      <Flex style={{ color: 'var(--pf-global--default-color--300)' }}>
        <FlexItem spacer={{ default: 'spacerXs' }}>
          <BanIcon />
        </FlexItem>
        <FlexItem className="status">
          <b>Disabled</b>
        </FlexItem>
      </Flex>
    );
  };

  return (
    <Stack hasGutter className="pf-u-p-md">
      <StackItem>
        <Toolbar id="toolbar-items">
          <ToolbarContent>
            {!isEditing && (
              <ToolbarItem>
                {!hasAccess ? (
                  <Tooltip
                    content={
                      <div>
                        To perform this action, you must be granted the
                        &quot;System Administrator&quot; role by your
                        Organization Administrator in your Setting&apos;s User
                        Access area.
                      </div>
                    }
                  >
                    {changeSettingsButton(isLoading, hasAccess, setIsEditing)}
                  </Tooltip>
                ) : (
                  changeSettingsButton(isLoading, hasAccess, setIsEditing)
                )}
              </ToolbarItem>
            )}
            {isEditing && (
              <>
                <ToolbarItem>
                  <Button
                    ouiaId="primary-save-button"
                    onClick={() => setConfirmChangesOpen(true)}
                    isDisabled={!madeChanges}
                  >
                    Save changes
                  </Button>
                </ToolbarItem>
                <ToolbarItem>
                  <Button
                    ouiaId="secondary-cancel-button"
                    onClick={() => cancelEditing()}
                    variant="secondary"
                  >
                    Cancel
                  </Button>
                </ToolbarItem>
                <ToolbarItem>
                  <Alert
                    variant="info"
                    isInline
                    isPlain
                    title="Changes will affect all systems connected with Red Hat connector"
                  />
                </ToolbarItem>
              </>
            )}
          </ToolbarContent>
        </Toolbar>
      </StackItem>
      <StackItem>
        <TableComposable aria-label="Settings table">
          <Thead>
            <Tr>
              <Th>Permission</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {permissions.map((row) => (
              <Tr key={row.name}>
                <Td
                  dataLabel="Permission"
                  width={80}
                  style={row.secondary && { paddingLeft: 70, fontSize: 14 }}
                >
                  <Stack>
                    <StackItem>
                      <Flex>
                        <FlexItem>
                          <b>{row.name}</b>
                        </FlexItem>
                        {row.additionalInfo && (
                          <FlexItem
                            style={{ color: 'var(--pf-global--Color--100)' }}
                          >
                            <i>{row.additionalInfo}</i>
                          </FlexItem>
                        )}
                      </Flex>
                    </StackItem>
                    <StackItem style={{ fontSize: 14 }}>
                      {row.description}
                    </StackItem>
                    {row.links && (
                      <StackItem className="stack-item">
                        <Flex>
                          {row.links.map((link) => (
                            <FlexItem key={link.name}>
                              <a
                                href={link.link}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {link.name}
                                <ExternalLinkAltIcon className="pf-u-ml-sm" />
                              </a>
                            </FlexItem>
                          ))}
                        </Flex>
                      </StackItem>
                    )}
                  </Stack>
                </Td>
                {!isEditing && <Td dataLabel="Status">{getStatusIcon(row)}</Td>}
                {isEditing && (
                  <Td dataLabel="Status">
                    <ToggleGroup aria-label="Default with single selectable">
                      <ToggleGroupItem
                        text="Enabled"
                        isSelected={formState[row.id].value}
                        onChange={() =>
                          setFormState({
                            ...formState,
                            [row.id]: { ...formState[row.id], value: true },
                          })
                        }
                        isDisabled={formState[row.id].isDisabled}
                      />
                      <ToggleGroupItem
                        text="Disabled"
                        isSelected={!formState[row.id].value}
                        onChange={() =>
                          setFormState({
                            ...formState,
                            [row.id]: { ...formState[row.id], value: false },
                          })
                        }
                        isDisabled={formState[row.id].isDisabled}
                      />
                    </ToggleGroup>
                  </Td>
                )}
              </Tr>
            ))}
          </Tbody>
        </TableComposable>
      </StackItem>
    </Stack>
  );
};

Services.propTypes = {
  setMadeChanges: propTypes.func.isRequired,
  defaults: propTypes.shape({
    useOpenSCAP: propTypes.bool,
    hasInsights: propTypes.bool,
    enableCloudConnector: propTypes.bool,
  }),
  onChange: propTypes.func.isRequired,
  madeChanges: propTypes.bool,
  setConfirmChangesOpen: propTypes.func.isRequired,
  isEditing: propTypes.bool.isRequired,
  setIsEditing: propTypes.func.isRequired,
};

Services.defaultProps = {
  defaults: {
    useOpenSCAP: false,
    hasInsights: false,
    enableCloudConnector: false,
  },
};

export default Services;
